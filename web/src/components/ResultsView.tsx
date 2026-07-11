"use client";

import type { ImportResult } from "@/types/crm";
import { RecordsTable } from "./RecordsTable";

interface Props {
  result: ImportResult;
  onReset: () => void;
}

export function ResultsView({ result, onReset }: Props) {
  const { records, skipped, totalImported, totalSkipped } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Summary row — prominent */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <StatCard
          label="Leads imported"
          value={totalImported.toLocaleString()}
          color="var(--success)"
          bg="var(--success-muted)"
        />
        <StatCard
          label="Rows skipped"
          value={totalSkipped.toLocaleString()}
          color="var(--skipped)"
          bg="var(--skipped-muted)"
        />
        <StatCard
          label="Total processed"
          value={(totalImported + totalSkipped).toLocaleString()}
          color="var(--text-primary)"
          bg="var(--surface-elevated)"
        />
      </div>

      {/* Imported records */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <h2
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--success)",
            }}
          >
            Imported
          </h2>
          <span
            className="font-mono"
            style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}
          >
            {totalImported} records
          </span>
        </div>
        <RecordsTable records={records} />
      </section>

      {/* Skipped rows */}
      {totalSkipped > 0 && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--skipped)",
              }}
            >
              Skipped
            </h2>
            <span
              className="font-mono"
              style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}
            >
              {totalSkipped} rows
            </span>
          </div>

          <div className="data-table-wrap">
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 80 }}>Row #</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {skipped.map((s, i) => (
                  <tr key={i}>
                    <td
                      className="font-mono"
                      style={{ color: "var(--skipped)", fontWeight: 600 }}
                    >
                      {s.index + 1}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{s.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Start over */}
      <div style={{ display: "flex", justifyContent: "flex-start", paddingTop: 4 }}>
        <button className="btn-ghost" onClick={onReset}>
          ← Import another file
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 140px",
        padding: "16px 20px",
        borderRadius: "var(--radius-md)",
        background: bg,
        border: `1px solid ${color}22`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        className="font-mono"
        style={{ fontSize: "1.8rem", fontWeight: 700, color, lineHeight: 1 }}
      >
        {value}
      </span>
      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}
