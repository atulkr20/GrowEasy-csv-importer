"use client";

import { useState, useCallback, useRef } from "react";
import type { BatchProgress, ImportResult } from "@/types/crm";
import type { StreamLine } from "@/types/api";

// In dev, Next.js rewrites /api/* → backend (see next.config.ts).
// In prod, set NEXT_PUBLIC_API_URL to the deployed API origin.
const API_BASE =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_API_URL &&
  process.env.NEXT_PUBLIC_API_URL !== "http://localhost:3000"
    ? process.env.NEXT_PUBLIC_API_URL
    : "";


export type StreamState =
  | { status: "idle" }
  | { status: "uploading"; progress: BatchProgress | null }
  | { status: "complete"; result: ImportResult }
  | { status: "error"; message: string };

export function useStreamImport() {
  const [state, setState] = useState<StreamState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const startImport = useCallback(async (file: File) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "uploading", progress: null });

    const form = new FormData();
    form.append("file", file);

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/import/upload-stream`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({ status: "error", message: "Network error — could not reach the server." });
      return;
    }

    if (!response.ok || !response.body) {
      let msg = `Server returned ${response.status}`;
      try {
        const json = await response.json() as { error?: string };
        if (json.error) msg = json.error;
      } catch { /* ignore */ }
      setState({ status: "error", message: msg });
      return;
    }

    // Read NDJSON line-by-line from the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let parsed: StreamLine;
          try {
            parsed = JSON.parse(trimmed) as StreamLine;
          } catch {
            continue; // skip malformed lines
          }

          if (parsed.type === "progress") {
            setState({
              status: "uploading",
              progress: {
                batchIndex: parsed.batchIndex,
                totalBatches: parsed.totalBatches,
                processedRows: parsed.processedRows,
                totalRows: parsed.totalRows,
              },
            });
          } else if (parsed.type === "complete") {
            setState({
              status: "complete",
              result: {
                records: parsed.records,
                skipped: parsed.skipped,
                totalImported: parsed.totalImported,
                totalSkipped: parsed.totalSkipped,
              },
            });
          } else if (parsed.type === "error") {
            setState({ status: "error", message: parsed.message });
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({
        status: "error",
        message: "Stream interrupted — the connection dropped mid-import.",
      });
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, startImport, reset };
}
