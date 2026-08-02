"use client";

import { ActivityEntry } from "@/lib/mock-data";
import { AlertTriangle, MapPin, Truck, CheckCircle2, ShieldCheck, Info } from "lucide-react";

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
  return (
    /*
      height: 100% + overflow-y: auto gives the list its own internal scrollbar
      so items are never clipped by the panel or page boundary.
      The bottom padding ensures the last item never touches the container edge.
    */
    <div style={{
      height: "100%",
      overflowY: "auto",
      padding: "8px 8px 16px",
    }}>
      {entries.map((entry, i) => {
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
  );
}
