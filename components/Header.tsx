"use client";

import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";

type Props = {
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
};

function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Baku",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const hh = parts.find((p) => p.type === "hour")?.value ?? "--";
      const mm = parts.find((p) => p.type === "minute")?.value ?? "--";
      setTime(`${hh}:${mm}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return <span style={{ width: 52, display: "inline-block" }} aria-hidden />;
  }

  return (
    <span
      suppressHydrationWarning
      style={{
        fontSize: "12px",
        color: "var(--text-secondary)",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.04em",
      }}
    >
      {time} AZT
    </span>
  );
}

export default function Header({
  onLogout,
  userName = "Operator",
  userRole = "Admin",
}: Props) {
  return (
    <header
      style={{
        height: "var(--header-height)",
        minHeight: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(255, 255, 255, 0.92)",
        borderBottom: "1px solid var(--glass-border)",
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Left — Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/logo-icon.png"
          alt="Pelagos"
          style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.08em",
              color: "var(--text-primary)",
            }}
          >
            Pelagos
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              marginTop: 2,
              letterSpacing: "0.01em",
            }}
          >
            Satellite & AI Oil Spill Intelligence
          </span>
        </div>
      </div>

      {/* Right — System status + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <LiveClock />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 20,
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.22)",
          }}
        >
          <span
            className="live-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-low)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--color-low)",
            }}
          >
            System Online
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingLeft: 16,
            borderLeft: "1px solid var(--glass-border)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--card-surface)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <User size={15} strokeWidth={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {userName}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{userRole}</span>
          </div>
          {onLogout && (
            <button
              type="button"
              title="Sign out"
              onClick={onLogout}
              style={{
                marginLeft: 4,
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--glass-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
