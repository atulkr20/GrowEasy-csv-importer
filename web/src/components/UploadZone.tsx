"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);

  function validate(file: File): string | null {
    const name = file.name.toLowerCase();
    const mime = file.type;
    const isCSV =
      mime === "text/csv" ||
      mime === "application/vnd.ms-excel" ||
      name.endsWith(".csv");
    if (!isCSV) return `"${file.name}" is not a CSV file. Only .csv files are accepted.`;
    if (file.size > 10 * 1024 * 1024) return "File exceeds the 10 MB limit.";
    return null;
  }

  function handle(file: File) {
    const err = validate(file);
    if (err) {
      setRejection(err);
      return;
    }
    setRejection(null);
    onFile(file);
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handle(file);
    },
    [disabled]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : rejection ? "var(--error)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          background: dragging
            ? "var(--accent-muted)"
            : rejection
            ? "var(--error-muted)"
            : "var(--surface)",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          opacity: disabled ? 0.5 : 1,
          outline: "none",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-md)",
            background: "var(--surface-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            marginBottom: 4,
          }}
        >
          📄
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            {dragging ? "Drop to upload" : "Drop a CSV file here"}
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            or{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              browse files
            </span>
            {" "}— .csv only, max 10 MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
            e.target.value = ""; // allow re-selecting same file
          }}
        />
      </div>

      {/* Inline rejection error — no browser alerts */}
      {rejection && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--error-muted)",
            border: "1px solid var(--error)",
            color: "var(--error)",
            fontSize: "0.82rem",
            fontWeight: 500,
          }}
        >
          <span style={{ flexShrink: 0, marginTop: 1 }}>✕</span>
          <span>{rejection}</span>
          <button
            onClick={() => setRejection(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--error)",
              cursor: "pointer",
              padding: 0,
              fontSize: "1rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
