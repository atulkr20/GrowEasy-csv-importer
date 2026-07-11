"use client";

type Step = 1 | 2 | 3 | 4;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Upload" },
  { n: 2, label: "Preview" },
  { n: 3, label: "Import" },
  { n: 4, label: "Results" },
];

interface Props {
  current: Step;
}

export function StepIndicator({ current }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "0 4px",
        marginBottom: "28px",
      }}
    >
      {STEPS.map(({ n, label }, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={n}
            style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1" : "none" }}
          >
            {/* Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace",
                  flexShrink: 0,
                  background: done
                    ? "var(--accent)"
                    : active
                    ? "var(--accent-muted)"
                    : "var(--surface-elevated)",
                  color: done
                    ? "#fff"
                    : active
                    ? "var(--accent)"
                    : "var(--text-tertiary)",
                  border: active
                    ? "2px solid var(--accent)"
                    : done
                    ? "2px solid var(--accent)"
                    : "2px solid var(--border)",
                  transition: "all 0.2s ease",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: active ? 600 : 400,
                  color: active
                    ? "var(--text-primary)"
                    : done
                    ? "var(--accent)"
                    : "var(--text-tertiary)",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s ease",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line (except after last step) */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 20,
                  background: done ? "var(--accent)" : "var(--border)",
                  transition: "background 0.3s ease",
                  minWidth: 20,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
