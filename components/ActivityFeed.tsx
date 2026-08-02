"use client";

import { useState } from "react";
import { ActivityEntry } from "@/lib/mock-data";
import { AlertTriangle, MapPin, Truck, CheckCircle2, ShieldCheck, Info, Search, Filter } from "lucide-react";

type Props = { 
  entries: ActivityEntry[];
  onEventClick?: (lat: number, lng: number) => void;
};

const SEVERITY: Record<ActivityEntry["type"], { color: string, icon: any }> = {
  alert:      { color: "var(--color-med)", icon: <AlertTriangle size={14} /> },
  detection:  { color: "var(--color-high)", icon: <MapPin size={14} /> },
  dispatch:   { color: "var(--text-secondary)", icon: <Truck size={14} /> },
  collection: { color: "var(--color-low)", icon: <ShieldCheck size={14} /> },
  conversion: { color: "var(--accent-teal)", icon: <CheckCircle2 size={14} /> },
  info:       { color: "var(--text-tertiary)", icon: <Info size={14} /> },
};

function timeAgo(ts: string) {
  const diff  = Date.now() - new Date(ts).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  if (days >= 1)  return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (mins >= 1)  return `${mins}m ago`;
  return "just now";
}

// Temporary manual mapping for demonstration since ActivityEntry lacks lat/lng.
const PORT_COORDS: Record<string, [number, number]> = {
  "baku": [40.365, 49.855], // Baku Port approximate spill area
  "sumgait": [40.590, 49.638],
  "alyat": [39.958, 49.420],
};

function portName(id: string) {
  return id === "baku" ? "Baku Port" : id === "sumgait" ? "Sumgait Port" : "Alyat Port";
}

export default function ActivityFeed({ entries, onEventClick }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || e.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search & Filter Bar */}
      <div style={{
        display: "flex", gap: "8px", padding: "0 8px 12px 8px", borderBottom: "1px solid var(--glass-border)", marginBottom: "8px"
      }}>
        <div style={{
          position: "relative", flex: 1, display: "flex", alignItems: "center"
        }}>
          <Search size={14} style={{ position: "absolute", left: "8px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search events..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: "6px", color: "var(--text-primary)", fontSize: "12px",
              padding: "4px 24px 4px 28px", outline: "none", cursor: "pointer",
              appearance: "none", WebkitAppearance: "none"
            }}
          >
            <option value="all">All Types</option>
            <option value="detection">Detection</option>
            <option value="alert">Alert</option>
            <option value="dispatch">Dispatch</option>
            <option value="collection">Collection</option>
            <option value="conversion">Conversion</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 8px 16px 8px",
      }}>
        {filteredEntries.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-secondary)", fontSize: "12px" }}>
            No matching events found.
          </div>
        )}
        {filteredEntries.map((entry, i) => {
          const sev = SEVERITY[entry.type] ?? SEVERITY.info;
          return (
            <div
              key={i}
              className="row-hover"
              onClick={() => {
              if (onEventClick) {
                const coords = PORT_COORDS[entry.portId] || PORT_COORDS["baku"];
                onEventClick(coords[0], coords[1]);
              }
            }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "10px 14px",
              marginBottom: "4px",
              borderLeft: `2px solid ${sev.color}`,
              background: "rgba(255,255,255,0.02)",
              minHeight: "0",
              overflow: "visible",
              cursor: onEventClick ? "pointer" : "default"
            }}
          >
            {/* Icon */}
            <div style={{
              color: sev.color,
              flexShrink: 0,
              marginTop: "2px",
            }}>
              {sev.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                lineHeight: 1.4,
                fontWeight: 500,
                /* Prevent long event strings from overflowing their column */
                wordBreak: "break-word",
              }}>
                {entry.event}
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginTop: "4px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}>
                <span>{portName(entry.portId)}</span>
                <span style={{ color: "var(--text-tertiary)" }}>•</span>
                <span>{timeAgo(entry.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
