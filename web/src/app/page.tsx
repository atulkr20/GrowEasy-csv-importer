"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/UploadZone";
import { CsvPreviewTable } from "@/components/CsvPreviewTable";
import { ImportProgress } from "@/components/ImportProgress";
import { ResultsView } from "@/components/ResultsView";
import { StepIndicator } from "@/components/StepIndicator";
import { parseCsvFile, type ParsedCsv } from "@/lib/csvParser";
import { useStreamImport } from "@/lib/useStreamImport";

type Step = 1 | 2 | 3 | 4;

type FlowState =
  | { step: 1 }
  | { step: 2; file: File; parsed: ParsedCsv }
  | { step: 3; file: File; parsed: ParsedCsv }
  | { step: 4 };

export default function HomePage() {
  const [flow, setFlow] = useState<FlowState>({ step: 1 });
  const [parseError, setParseError] = useState<string | null>(null);
  const { state: streamState, startImport, reset: resetStream } = useStreamImport();

  // Derive current step for StepIndicator
  const currentStep: Step =
    streamState.status === "complete" ? 4 : (flow.step as Step);

  // ── Step 1 → 2: File selected, parse client-side ─────────────────
  const onFile = useCallback(async (file: File) => {
    setParseError(null);
    try {
      const parsed = await parseCsvFile(file);
      if (parsed.rows.length === 0) {
        setParseError("This CSV has no data rows. Check that it is not empty.");
        return;
      }
      setFlow({ step: 2, file, parsed });
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Failed to parse the CSV file."
      );
    }
  }, []);

  // ── Step 2 → 1: Go back ──────────────────────────────────────────
  const goBack = useCallback(() => {
    setFlow({ step: 1 });
    setParseError(null);
    resetStream();
  }, [resetStream]);

  // ── Step 2 → 3: Trigger import ───────────────────────────────────
  const onImport = useCallback(() => {
    if (flow.step !== 2) return;
    const { file, parsed } = flow;
    setFlow({ step: 3, file, parsed });
    startImport(file);
  }, [flow, startImport]);

  // ── After complete, show results ─────────────────────────────────
  // Results are driven by streamState, not flow step

  const isUploading = streamState.status === "uploading";
  const isComplete = streamState.status === "complete";
  const isStreamError = streamState.status === "error";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "0 16px 48px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "20px 0 28px" }}>
        <StepIndicator current={isComplete ? 4 : (flow.step as Step)} />
      </div>

      {/* ── Step 1: Upload ─────────────────────────────────── */}
      {flow.step === 1 && !isComplete && (
        <section>
          <SectionHeader
            title="Upload a CSV file"
            sub="Drop any CSV export — Facebook Leads, Google Ads, manual sheets, other CRMs. The AI will map the columns."
          />
          <UploadZone onFile={onFile} />
          {parseError && <InlineError message={parseError} />}
        </section>
      )}

      {/* ── Step 2: Preview ────────────────────────────────── */}
      {flow.step === 2 && !isUploading && !isComplete && (
        <section>
          <SectionHeader
            title="Preview"
            sub={`${flow.parsed.rows.length.toLocaleString()} rows · ${flow.parsed.headers.length} columns — check the data before importing`}
          />
          <div style={{ marginBottom: 16 }}>
            <CsvPreviewTable
              headers={flow.parsed.headers}
              rows={flow.parsed.rows}
            />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-primary" onClick={onImport}>
              Import {flow.parsed.rows.length.toLocaleString()} rows →
            </button>
            <button className="btn-ghost" onClick={goBack}>
              ← Choose different file
            </button>
          </div>
        </section>
      )}

      {/* ── Step 3: Uploading / streaming ─────────────────── */}
      {(flow.step === 3 || isUploading) && !isComplete && !isStreamError && (
        <section>
          <ImportProgress
            progress={streamState.status === "uploading" ? streamState.progress : null}
            fileName={flow.step >= 2 ? (flow as { file: File }).file?.name ?? "" : ""}
          />
        </section>
      )}

      {/* ── Stream error ───────────────────────────────────── */}
      {isStreamError && (
        <section>
          <div
            role="alert"
            style={{
              padding: "20px 24px",
              borderRadius: "var(--radius-lg)",
              background: "var(--error-muted)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              marginBottom: 16,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Import failed</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
              {streamState.message}
            </p>
          </div>
          <button className="btn-ghost" onClick={goBack}>
            ← Try again
          </button>
        </section>
      )}

      {/* ── Step 4: Results ────────────────────────────────── */}
      {isComplete && streamState.status === "complete" && (
        <section>
          <SectionHeader
            title="Done"
            sub={`${streamState.result.totalImported} leads imported · ${streamState.result.totalSkipped} skipped`}
          />
          <ResultsView result={streamState.result} onReset={goBack} />
        </section>
      )}
    </main>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 4,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{sub}</p>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        background: "var(--error-muted)",
        border: "1px solid var(--error)",
        color: "var(--error)",
        fontSize: "0.82rem",
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}
