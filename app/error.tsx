"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          background: "var(--bg-elevated)",
          border: "1px solid var(--glass-border)",
          borderRadius: 12,
          padding: "32px 28px",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "rgba(224, 122, 95, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#C1503A",
          }}
        >
          <AlertTriangle size={22} strokeWidth={2} />
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 650,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            margin: "0 0 24px",
          }}
        >
          This section of SeaSeatry hit an unexpected error. You can try again, or head back to the
          dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--accent)",
              color: "var(--bg-elevated)",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RotateCcw size={14} />
            Try again
          </button>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--glass-border)",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
