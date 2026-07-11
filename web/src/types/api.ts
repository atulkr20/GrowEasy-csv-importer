import type { BatchProgress, ImportResult } from "./crm";

export type StreamProgressLine = { type: "progress" } & BatchProgress;
export type StreamCompleteLine = { type: "complete" } & ImportResult;
export type StreamErrorLine = { type: "error"; message: string };

export type StreamLine =
  | StreamProgressLine
  | StreamCompleteLine
  | StreamErrorLine;

export type ImportStatus =
  | "idle"
  | "rejected"
  | "parsing"
  | "previewing"
  | "uploading"
  | "streaming_error"
  | "complete";

export interface ApiErrorResponse {
  error: string;
}
