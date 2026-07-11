"use client";

import type { BatchProgress } from "@/types/crm";

interface Props {
  progress: BatchProgress | null;
  fileName: string;
}

export function ImportProgress({ progress, fileName }: Props) {
  const totalBatches = progress?.totalBatches ?? 1;
  const batchIndex = progress?.batchIndex ?? 0;
  const processedRows = progress?.processedRows ?? 0;
  const totalRows = progress?.totalRows ?? 0;

  const pct = totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        padding: "32px 0",
      }}
    >
      {/* Header */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          AI extraction in progress
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Processing{" "}
          <span className="font-mono" style={{ color: "var(--text-primary)" }}>
            {fileName}
          </span>
          {" "}— mapping messy columns to CRM schema
        </p>
      </div>

      {/* SIGNATURE ELEMENT: Batch pipeline track */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: totalBatches }).map((_, i) => {
            const segIdx = i + 1;
            const isDone = segIdx < batchIndex || (batchIndex > 0 && segIdx <= batchIndex && processedRows === totalRows);
            const isActive = segIdx === batchIndex && processedRows < totalRows;
            const isPending = segIdx > batchIndex;

            return (
              <div
                key={i}
                title={`Batch ${segIdx} of ${totalBatches}`}
                className={isActive ? "batch-segment-active" : undefined}
                style={{
                  flex: 1,
                  minWidth: 12,
                  maxWidth: 60,
                  height: 8,
                  borderRadius: 4,
                  background: isDone
                    ? "var(--success)"
                    : isActive
                    ? "var(--accent)"
                    : "var(--surface-elevated)",
                  border: isActive
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                  transition: "background 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Batch label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            {batchIndex > 0 ? (
              <>
                Batch{" "}
                <span className="font-mono" style={{ color: "var(--accent)" }}>
                  {batchIndex}
                </span>
                {" "}of{" "}
                <span className="font-mono">{totalBatches}</span>
              </>
            ) : (
              "Preparing first batch…"
            )}
          </span>
          <span className="font-mono" style={{ color: "var(--text-primary)" }}>
            {processedRows.toLocaleString()} / {totalRows.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* Classic percentage bar (secondary) */}
      <div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "var(--surface-elevated)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "var(--accent)",
              borderRadius: 2,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: "0.72rem",
            color: "var(--text-tertiary)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {pct}%
        </div>
      </div>

      {/* Status note */}
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-tertiary)",
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
        }}
      >
        The AI is reading column names and values to map them to the CRM schema.
        This takes a few seconds per batch — do not close the tab.
      </p>
    </div>
  );
}
