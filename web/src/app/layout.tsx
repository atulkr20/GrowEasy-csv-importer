import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "GrowEasy CSV Importer",
  description:
    "Upload any CSV export — Facebook Leads, Google Ads, manual sheets — and the AI maps messy columns into a clean CRM schema automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Site header */}
        <header
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "0 16px",
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Wordmark */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                GrowEasy
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-tertiary)",
                  fontWeight: 400,
                }}
              >
                CSV Importer
              </span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
