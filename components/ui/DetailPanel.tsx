"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
};

export default function DetailPanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  width = 440,
}: Props) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(43, 45, 66, 0.18)",
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
        style={{
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
        }}
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
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>{children}</div>
      </aside>
    </>
  );
}
