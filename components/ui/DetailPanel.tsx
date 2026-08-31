"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  /** "side" (default) slides in from the right edge. "center" opens as a
   * centered mini-window, used for the guided demo flow (map → incident →
   * AI analysis). */
  variant?: "side" | "center";
};

export default function DetailPanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  width = 440,
  variant = "side",
}: Props) {
  const centered = variant === "center";

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: centered ? "rgba(43, 45, 66, 0.32)" : "rgba(43, 45, 66, 0.18)",
          zIndex: 80,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.22s ease",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={
          centered
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                maxHeight: "88vh",
                width,
                maxWidth: "94vw",
                background: "var(--bg-elevated)",
                border: "1px solid var(--glass-border)",
                borderRadius: 16,
                zIndex: 90,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 64px rgba(43, 45, 66, 0.28)",
                transform: open
                  ? "translate(-50%, -50%) scale(1)"
                  : "translate(-50%, -50%) scale(0.94)",
                opacity: open ? 1 : 0,
                transition: "transform 0.22s ease, opacity 0.22s ease",
                willChange: "transform, opacity",
                visibility: open ? "visible" : "hidden",
              }
            : {
                position: "fixed",
                top: 0,
                right: 0,
                height: "100vh",
                width,
                maxWidth: "100vw",
                background: "var(--bg-elevated)",
                borderLeft: "1px solid var(--glass-border)",
                zIndex: 90,
                display: "flex",
                flexDirection: "column",
                boxShadow: open ? "-12px 0 32px rgba(43, 45, 66, 0.14)" : "none",
                transform: open ? "translateX(0px)" : "translateX(100%)",
                transition: "transform 0.22s ease",
                willChange: "transform",
                visibility: open ? "visible" : "hidden",
              }
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 20px",
            borderBottom: "1px solid var(--glass-border)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 650,
                color: "var(--text-primary)",
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--glass-border)",
              background: "transparent",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, minHeight: 0 }}>{children}</div>
      </aside>
    </>
  );
}
