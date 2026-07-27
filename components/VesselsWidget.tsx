"use client";

import { Vessel, Port } from "@/lib/mock-data";
import { Ship, Anchor, Navigation, Radio } from "lucide-react";

type Props = {
  vessels: Vessel[];
  port: Port;
};

const STATUS_STYLES: Record<Vessel["status"], { color: string; bg: string; border: string }> = {
  "In port":     { color: "var(--color-low)", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)" },
  "Approaching": { color: "var(--color-med)", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.2)" },
  "Transiting":  { color: "var(--text-secondary)", bg: "rgba(255, 255, 255, 0.05)", border: "var(--glass-border)" },
};

function headingArrow(deg: number): string {
  // Unicode arrow based on heading
  const dir = Math.round(deg / 45) % 8;
  return ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"][dir];
}

function getVesselIcon(type: string) {
  if (type.includes("Cargo")) return <Ship size={14} />;
  if (type.includes("Tanker")) return <Radio size={14} />;
  if (type.includes("Tug")) return <Anchor size={14} />;
  return <Navigation size={14} />;
}

export default function VesselsWidget({ vessels, port }: Props) {
  const portVessels = vessels.filter(v => v.portId === port.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 50px 46px 44px 80px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(0,0,0,0.1)",
      }}>
        {["Vessel", "Dist", "Spd", "Hdg", "Status"].map(h => (
          <span key={h} style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {h}
          </span>
        ))}
      </div>

      {portVessels.length === 0 && (
        <div style={{ padding: "24px 14px", fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center" }}>
          No vessels tracked for {port.name}
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        {portVessels.map((v, i) => {
          const st = STATUS_STYLES[v.status];
          return (
            <div
              key={v.id}
              className="row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 50px 46px 44px 80px",
                padding: "10px 16px",
                alignItems: "center",
                borderBottom: i < portVessels.length - 1 ? "1px solid var(--glass-border)" : "none",
                margin: "4px 8px"
              }}
            >
              {/* Name + type with Icon Thumbnail */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div style={{
                  width: "28px", height: "28px",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent-teal)",
                  flexShrink: 0,
                }}>
                  {getVesselIcon(v.type)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    lineHeight: 1.35,
                    /* Truncate long names with ellipsis instead of wrapping */
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>{v.name}</div>
                  <div style={{
                    fontSize: "10px",
                    color: "var(--text-secondary)",
                    marginTop: "3px",
                    lineHeight: 1.3,
                  }}>{v.type}</div>
                </div>
              </div>

              {/* Distance */}
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                {v.distanceKm.toFixed(1)}
              </div>

              {/* Speed */}
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                {v.speedKnots.toFixed(1)}
              </div>

              {/* Heading */}
              <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }} title={`${v.heading}°`}>
                {headingArrow(v.heading)}
              </div>

              {/* Status pill */}
              <div>
                <span style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 500,
                  padding: "2px 7px",
                  borderRadius: "4px",
                  background: st.bg,
                  color: st.color,
                  border: `1px solid ${st.border}`,
                  whiteSpace: "nowrap",
                }}>
                  {v.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 16px",
        borderTop: "1px solid var(--glass-border)",
        background: "rgba(0,0,0,0.1)",
        fontSize: "10px",
        color: "var(--text-tertiary)",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>{portVessels.length} vessel{portVessels.length !== 1 ? "s" : ""} · {port.name}</span>
        <span>AIS Telemetry</span>
      </div>
    </div>
  );
}
