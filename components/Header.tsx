"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe, ChevronDown, LayoutTemplate, Maximize, Settings, Check, Edit2, RotateCcw,
  Satellite, Eye, EyeOff, LogOut, Bell,
} from "lucide-react";
import { Port, AlertMessage } from "@/lib/mock-data";
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
  onLogout?: () => void;
  isSatelliteView?: boolean;
  onSatelliteToggle?: () => void;
  editMode?: boolean;
  onEditToggle?: () => void;
  onResetLayout?: () => void;
  alerts?: AlertMessage[];
  onAcknowledgeAlert?: (id: string) => void;
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
  onLogout,
  isSatelliteView,
  onSatelliteToggle,
  editMode,
  onEditToggle,
  onResetLayout,
  alerts = [],
  onAcknowledgeAlert,
}: Props) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const alertsMenuRef = useRef<HTMLDivElement>(null);

  // Close theme menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    };
    if (showThemeMenu || showAlerts) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showThemeMenu, showAlerts]);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);
  const unreadCount = unreadAlerts.length;

  return (
    <header
      style={{
        height: "64px",
        minHeight: "64px",
        maxHeight: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(26, 29, 41, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--glass-border)",
        boxShadow: "0 1px 0 0 var(--glass-border), 0 4px 24px rgba(0,0,0,0.35)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── LEFT SIDE ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Logo block */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
        </div>

        <Divider />

        {/* Base Map / Live Satellite Toggle */}
        {onSatelliteToggle && (
          <div 
            onClick={onSatelliteToggle}
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-base)",
              border: "1px solid var(--glass-border)",
              borderRadius: "20px",
              padding: "2px",
              cursor: "pointer",
              position: "relative",
              width: "200px",
              height: "28px"
            }}
          >
            <div style={{
              flex: 1, textAlign: "center", zIndex: 1, fontSize: "11px", 
              color: !isSatelliteView ? "#000" : "var(--text-secondary)",
              fontWeight: !isSatelliteView ? 600 : 400,
              transition: "color 0.2s",
              userSelect: "none"
            }}>
              Base Map
            </div>
            <div style={{
              flex: 1, textAlign: "center", zIndex: 1, fontSize: "11px", 
              color: isSatelliteView ? "#000" : "var(--text-secondary)",
              fontWeight: isSatelliteView ? 600 : 400,
              transition: "color 0.2s",
              userSelect: "none"
            }}>
              Live Satellite
            </div>
            <div style={{
              position: "absolute",
              top: "2px", left: "2px", bottom: "2px",
              width: "calc(50% - 2px)",
              background: "var(--text-primary)",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transform: isSatelliteView ? "translateX(100%)" : "translateX(0)",
              transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}/>
          </div>
        )}

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
              padding: "6px 32px 6px 12px",
              cursor: "pointer",
              appearance: "none",
              outline: "none",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--glass-border-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--glass-border)")}
          >
            {ports.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "var(--card-surface)", color: "var(--text-primary)" }}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="var(--text-secondary)"
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* ── RIGHT SIDE ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "24px" }}>
        
        <LiveBadge />

        {/* AI Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-low)',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>AI Status: Active Scanning...</span>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
          @keyframes bell-shake {
            0%, 10% { transform: rotate(0deg); }
            15% { transform: rotate(15deg); }
            20% { transform: rotate(-15deg); }
            25% { transform: rotate(10deg); }
            30% { transform: rotate(-10deg); }
            35% { transform: rotate(5deg); }
            40%, 100% { transform: rotate(0deg); }
          }
        `}} />

        <LiveClock />

        <Divider />

        {/* Layout Edit Buttons */}
        {editMode && onResetLayout && (
          <button
            onClick={onResetLayout}
            title="Reset to default layout"
            style={{
              background: "transparent",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 500,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
        
        {onEditToggle && (
          <button
            onClick={onEditToggle}
            title={editMode ? "Save layout" : "Edit layout"}
            style={{
              background: editMode ? "rgba(177, 178, 181, 0.15)" : "transparent",
              border: `1px solid ${editMode ? "var(--glass-border-light)" : "var(--glass-border)"}`,
              color: editMode ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 500,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { if (!editMode) e.currentTarget.style.background = "var(--glass-bg-hover)"; }}
            onMouseLeave={(e) => { if (!editMode) e.currentTarget.style.background = "transparent"; }}
          >
            {editMode ? <><Check size={14} /> Done</> : <><Edit2 size={14} /> Edit</>}
          </button>
        )}
        <Divider />

        {/* Alert Center */}
        <div ref={alertsMenuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowAlerts(v => !v)}
            title="Alert Center"
            style={{
              background: "transparent",
              border: "none",
              color: unreadCount > 0 ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: "6px",
              borderRadius: "6px",
              transition: "background 0.2s",
              position: "relative"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={16} style={{ animation: unreadCount > 0 ? "bell-shake 3s infinite" : "none" }} />
            {unreadCount > 0 && (
              <div style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "8px",
                height: "8px",
                backgroundColor: "var(--color-high)",
                borderRadius: "50%",
                boxShadow: "0 0 6px var(--color-high)",
              }} />
            )}
          </button>

          {showAlerts && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: 0,
                width: "320px",
                background: "rgba(26, 29, 41, 0.97)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                zIndex: 200,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <div style={{ padding: "4px 8px", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px", marginBottom: "4px" }}>
                Alert Center
              </div>
              {alerts.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "var(--text-secondary)" }}>
                  No alerts.
                </div>
              ) : (
                alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(alert => {
                  const sevColor = alert.severity === "critical" ? "var(--color-high)" : alert.severity === "high" ? "var(--color-med)" : alert.severity === "medium" ? "var(--color-low)" : "var(--text-secondary)";
                  return (
                    <div key={alert.id} style={{
                      padding: "8px",
                      borderRadius: "6px",
                      background: alert.acknowledged ? "transparent" : "var(--glass-bg)",
                      border: "1px solid",
                      borderColor: alert.acknowledged ? "transparent" : "var(--glass-border)",
                      opacity: alert.acknowledged ? 0.6 : 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sevColor }} />
                          <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: sevColor }}>{alert.severity}</span>
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {alert.message}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{alert.location}</span>
                        {!alert.acknowledged && onAcknowledgeAlert && (
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--glass-border-light)",
                              borderRadius: "4px",
                              color: "var(--text-primary)",
                              fontSize: "10px",
                              padding: "2px 6px",
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <IconBtn title="Settings">
          <Settings size={15} />
        </IconBtn>

        {/* Account Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Account Settings / Logout"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: "6px",
              borderRadius: "6px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
