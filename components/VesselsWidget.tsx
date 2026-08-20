"use client";

import { useState } from "react";
import { Vessel, Port, mockData } from "@/lib/mock-data";
import { Ship, Anchor, Navigation, Radio, Search, Filter, AlertTriangle } from "lucide-react";

type Props = {
  vessels: Vessel[];
  port: Port;
};

const STATUS_STYLES: Record<Vessel["status"], { color: string; bg: string; border: string }> = {
  "In port":     { color: "var(--color-low)", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)" },
  "Approaching": { color: "var(--color-med)", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.2)" },
  "Transiting":  { color: "var(--text-secondary)", bg: "rgba(43, 45, 66, 0.06)", border: "var(--glass-border)" },
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function VesselsWidget({ vessels, port }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const portVessels = vessels.filter(v => v.portId === port.id).filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search & Filter Bar */}
      <div style={{
        display: "flex", gap: "8px", padding: "0 16px 12px 16px", borderBottom: "1px solid var(--glass-border)"
      }}>
        <div style={{
          position: "relative", flex: 1, display: "flex", alignItems: "center"
        }}>
          <Search size={14} style={{ position: "absolute", left: "8px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search vessels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: "6px", color: "var(--text-primary)", fontSize: "12px",
              padding: "4px 8px 4px 28px", outline: "none"
            }}
          />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Filter size={14} style={{ position: "absolute", left: "8px", color: "var(--text-secondary)", pointerEvents: "none" }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: "6px", color: "var(--text-primary)", fontSize: "12px",
              padding: "4px 24px 4px 28px", outline: "none", cursor: "pointer",
              appearance: "none", WebkitAppearance: "none"
            }}
          >
            <option value="all">All Status</option>
            <option value="In port">In port</option>
            <option value="Approaching">Approaching</option>
            <option value="Transiting">Transiting</option>
          </select>
        </div>
      </div>

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
          No vessels found.
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        {portVessels.map((v, i) => {
          const st = STATUS_STYLES[v.status];
          const isNearSpill = mockData.detections.some(d => d.portId === port.id && haversine(v.lat, v.lng, d.lat, d.lng) <= 2.5);
          
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
                  background: isNearSpill ? "rgba(220, 38, 38, 0.15)" : "var(--glass-bg)",
                  border: isNearSpill ? "1px solid var(--color-high)" : "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isNearSpill ? "var(--color-high)" : "var(--accent-teal)",
                  flexShrink: 0,
                  boxShadow: isNearSpill ? "0 0 10px rgba(220, 38, 38, 0.4)" : "none",
                }} title={isNearSpill ? "Proximity Warning" : ""}>
                  {isNearSpill ? <AlertTriangle size={14} /> : getVesselIcon(v.type)}
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
