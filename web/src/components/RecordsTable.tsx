"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { CrmRecord } from "@/types/crm";
import { CRM_COLUMNS, CRM_COLUMN_LABELS } from "@/types/crm";

interface Props {
  records: CrmRecord[];
}

// CRM status colors
function statusBadge(status: string) {
  const s = status.toUpperCase();
  const color =
    s.includes("GOOD") || s.includes("CONVERTED")
      ? "var(--success)"
      : s.includes("NOT_CONNECT") || s.includes("DID_NOT")
      ? "var(--skipped)"
      : s.includes("FOLLOW")
      ? "var(--accent)"
      : "var(--text-secondary)";

  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.72rem",
        color,
        background:
          color === "var(--success)"
            ? "var(--success-muted)"
            : color === "var(--skipped)"
            ? "var(--skipped-muted)"
            : color === "var(--accent)"
            ? "var(--accent-muted)"
            : "var(--surface-elevated)",
        padding: "2px 6px",
        borderRadius: 100,
        whiteSpace: "nowrap",
      }}
    >
      {status || "—"}
    </span>
  );
}

export function RecordsTable({ records }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  if (records.length === 0) {
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}
      >
        No records were imported.
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
        style={{ overflow: "auto", maxHeight: 400 }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ color: "var(--text-tertiary)", minWidth: 44 }}>#</th>
              {CRM_COLUMNS.map((col) => (
                <th key={col}>{CRM_COLUMN_LABELS[col]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Top spacer */}
            {paddingTop > 0 && (
              <tr><td style={{ height: paddingTop, padding: 0, border: "none" }} colSpan={CRM_COLUMNS.length + 1} /></tr>
            )}

            {virtualItems.map((virtualRow) => {
              const rec = records[virtualRow.index];
              return (
                <tr key={virtualRow.index} className="row-enter">
                  <td
                    style={{
                      color: "var(--text-tertiary)",
                      minWidth: 44,
                      userSelect: "none",
                    }}
                  >
                    {virtualRow.index + 1}
                  </td>
                  {CRM_COLUMNS.map((col) => (
                    <td key={col} title={rec[col] ?? ""}>
                      {col === "crm_status"
                        ? statusBadge(rec[col])
                        : rec[col] || (
                            <span style={{ color: "var(--text-tertiary)" }}>—</span>
                          )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom spacer */}
            {paddingBottom > 0 && (
              <tr><td style={{ height: paddingBottom, padding: 0, border: "none" }} colSpan={CRM_COLUMNS.length + 1} /></tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-elevated)",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        <span className="font-mono" style={{ color: "var(--success)", fontWeight: 700 }}>
          {records.length.toLocaleString()}
        </span>{" "}
        records imported
      </div>
    </div>
  );
}
