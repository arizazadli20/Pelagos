"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe, ChevronDown, LayoutTemplate, Maximize, Layers, Check,
  Satellite, Eye, EyeOff,
} from "lucide-react";
import { Port } from "@/lib/mock-data";
import StageTracker from "@/components/StageTracker";

export type LayoutMode = "grid" | "immersive";

type Props = {
  ports: Port[];
  selectedPort: Port;
  onPortChange: (port: Port) => void;
  layoutMode?: LayoutMode;
  onLayoutModeChange?: (mode: LayoutMode) => void;
  mapTheme?: "dark" | "light" | "satellite";
  onThemeChange?: (theme: "dark" | "light" | "satellite") => void;
};

// ─── Live Clock ───────────────────────────────────────────────────────────────
// Rendered client-side only (mounted guard) to prevent SSR/hydration mismatch.
// Uses tabular-nums so digit-width changes never shift siblings.
function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [hh, setHh] = useState("00");
  const [mm, setMm] = useState("00");
  const [ss, setSs] = useState("00");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const d = new Date();
      setHh(String(d.getUTCHours()).padStart(2, "0"));
      setMm(String(d.getUTCMinutes()).padStart(2, "0"));
      setSs(String(d.getUTCSeconds()).padStart(2, "0"));
      setDateStr(
        d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Pre-hydration: render a fixed-size invisible placeholder so layout is stable
  if (!mounted) {
    return (
      <div style={{ width: "154px", height: "34px", flexShrink: 0 }} aria-hidden />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
      {/* Time — always one line, monospace digits */}
      <span
        suppressHydrationWarning
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "ui-monospace, 'Roboto Mono', monospace",
          letterSpacing: "0.04em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {hh}:{mm}:<span style={{ color: "var(--text-secondary)" }}>{ss}</span>
        <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginLeft: "4px", letterSpacing: "0.05em" }}>
          UTC
        </span>
      </span>
      {/* Date — always one line below, fixed format */}
      <span
        suppressHydrationWarning
        style={{
          fontSize: "10px",
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
          marginTop: "3px",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {dateStr}
      </span>
    </div>
  );
}

// ─── LIVE badge ────────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(34, 197, 94, 0.08)",
        border: "1px solid rgba(34, 197, 94, 0.25)",
        borderRadius: "20px",
        padding: "4px 10px",
        flexShrink: 0,
      }}
    >
      <div
        className="live-dot"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "var(--color-low)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--color-low)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Live
      </span>
    </div>
  );
}

// ─── Thin vertical divider ─────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "24px",
        background: "var(--glass-border)",
        flexShrink: 0,
        alignSelf: "center",
      }}
    />
  );
}

// ─── Icon button helper ────────────────────────────────────────────────────────
function IconBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "32px",
        height: "32px",
        background: active
          ? "rgba(177, 178, 181, 0.15)"
          : hovered
          ? "var(--glass-bg-hover)"
          : "var(--glass-bg)",
        border: `1px solid ${active ? "var(--glass-border-light)" : "var(--glass-border)"}`,
        borderRadius: "8px",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.18s ease",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function Header({
  ports,
  selectedPort,
  onPortChange,
  layoutMode = "grid",
  onLayoutModeChange,
  mapTheme,
  onThemeChange,
}: Props) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showThemeMenu]);

  const themeLabels: Record<string, string> = {
    dark: "Dark Map",
    light: "Light Map",
    satellite: "Satellite",
  };

  return (
    <header
      style={{
        /* Fixed height — never grows with content */
        height: "64px",
        minHeight: "64px",
        maxHeight: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "0",
        /* Glass layer floating over the map */
        background: "rgba(26, 29, 41, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--glass-border)",
        boxShadow: "0 1px 0 0 var(--glass-border), 0 4px 24px rgba(0,0,0,0.35)",
        /* Sticky top bar */
        position: "sticky",
        top: 0,
        zIndex: 100,
        /* Contain everything — no child should spill above */
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── ZONE 1: Logo + Breadcrumb ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
          /* Reserve fixed width so Zone 2 stays centered regardless of content */
          width: "220px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: "34px",
            height: "34px",
            background: "var(--text-primary)",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bg-base)",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <Globe size={18} strokeWidth={2.5} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-primary)",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
          >
            PEYKGÖZ
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Global Ops
          </span>
        </div>

        {/* Separator after logo block */}
        <Divider />
      </div>

      {/* ── ZONE 2: Workflow Stepper (centered) ──────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <StageTracker />
      </div>

      {/* ── ZONE 3: Controls + Clock + Port ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
          /* Mirror the Zone 1 width so stepper stays truly centered */
          width: "220px",
          justifyContent: "flex-end",
        }}
      >
        <Divider />

        {/* Layout toggle — grid vs immersive */}
        {onLayoutModeChange && (
          <div
            style={{
              display: "flex",
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "2px",
              gap: "2px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => onLayoutModeChange("grid")}
              title="Grid Layout"
              style={{
                background: layoutMode === "grid" ? "rgba(177,178,181,0.15)" : "transparent",
                color: layoutMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "5px",
                padding: "5px 7px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.18s",
              }}
            >
              <LayoutTemplate size={14} />
            </button>
            <button
              onClick={() => onLayoutModeChange("immersive")}
              title="Immersive Layout"
              style={{
                background: layoutMode === "immersive" ? "rgba(177,178,181,0.15)" : "transparent",
                color: layoutMode === "immersive" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "5px",
                padding: "5px 7px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.18s",
              }}
            >
              <Maximize size={14} />
            </button>
          </div>
        )}

        {/* Layers / Map theme button */}
        {onThemeChange && mapTheme && (
          <div ref={themeMenuRef} style={{ position: "relative", flexShrink: 0 }}>
            <IconBtn
              title={`Map: ${themeLabels[mapTheme]}`}
              active={showThemeMenu}
              onClick={() => setShowThemeMenu((v) => !v)}
            >
              <Layers size={15} />
            </IconBtn>

            {showThemeMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  width: "152px",
                  background: "rgba(26, 29, 41, 0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "10px",
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  zIndex: 200,
                }}
              >
                {(["dark", "light", "satellite"] as const).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      onThemeChange(id);
                      setShowThemeMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: mapTheme === id ? "var(--glass-bg)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: mapTheme === id ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: mapTheme === id ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (mapTheme !== id) e.currentTarget.style.background = "var(--glass-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (mapTheme !== id) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {themeLabels[id]}
                    {mapTheme === id && <Check size={13} color="var(--color-low)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIVE badge */}
        <LiveBadge />

        {/* Clock */}
        <LiveClock />

        <Divider />

        {/* Port selector */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            id="port-selector"
            value={selectedPort.id}
            onChange={(e) => {
              const port = ports.find((p) => p.id === e.target.value);
              if (port) onPortChange(port);
            }}
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 28px 6px 10px",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s, background 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--glass-bg)")}
          >
            {ports.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "var(--bg-base)" }}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            color="var(--text-secondary)"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </header>
  );
}
