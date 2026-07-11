"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Props {
  headers: string[];
  rows: Record<string, string>[];
}

export function CsvPreviewTable({ headers, rows }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
        }}
      >
        No rows found in this file.
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <div className="data-table-wrap">
      <div
        ref={parentRef}
        style={{ overflow: "auto", maxHeight: 420 }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ color: "var(--text-tertiary)", minWidth: 52 }}>#</th>
              {headers.map((h) => (
                <th key={h} title={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Top spacer */}
            {paddingTop > 0 && (
              <tr><td style={{ height: paddingTop, padding: 0, border: "none" }} colSpan={headers.length + 1} /></tr>
            )}

            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr key={virtualRow.index}>
                  <td
                    style={{
                      color: "var(--text-tertiary)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      userSelect: "none",
                      minWidth: 52,
                    }}
                  >
                    {virtualRow.index + 1}
                  </td>
                  {headers.map((h) => (
                    <td key={h} title={row[h] ?? ""}>{row[h] ?? ""}</td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom spacer */}
            {paddingBottom > 0 && (
              <tr><td style={{ height: paddingBottom, padding: 0, border: "none" }} colSpan={headers.length + 1} /></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-elevated)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        <span className="font-mono" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {rows.length.toLocaleString()}
        </span>
        rows ·{" "}
        <span className="font-mono" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {headers.length}
        </span>
        columns — scroll horizontally to see all fields
      </div>
    </div>
  );
}
