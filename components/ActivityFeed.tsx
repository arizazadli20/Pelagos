"use client";

import { ActivityEntry } from "@/lib/mock-data";
import {
  Satellite,
  Brain,
  UserCheck,
  ShieldCheck,
  Siren,
  Droplets,
  Ship,
  AlertTriangle,
  Info,
} from "lucide-react";

type Props = {
  entries: ActivityEntry[];
  onEventClick?: (lat: number, lng: number) => void;
};

const META: Record<
  ActivityEntry["type"],
  { color: string; icon: React.ReactNode; label: string }
> = {
  detection: { color: "var(--color-high)", icon: <Satellite size={14} />, label: "Detection" },
  ai_analysis: { color: "var(--accent)", icon: <Brain size={14} />, label: "AI" },
  review: { color: "var(--color-med)", icon: <UserCheck size={14} />, label: "Review" },
  confirmed: { color: "var(--color-med)", icon: <ShieldCheck size={14} />, label: "Confirmed" },
  response: { color: "var(--accent)", icon: <Siren size={14} />, label: "Response" },
  cleanup: { color: "var(--color-low)", icon: <Droplets size={14} />, label: "Cleanup" },
  vessel: { color: "#60a5fa", icon: <Ship size={14} />, label: "Vessel" },
  alert: { color: "var(--color-med)", icon: <AlertTriangle size={14} />, label: "Alert" },
  dispatch: { color: "var(--text-secondary)", icon: <Siren size={14} />, label: "Dispatch" },
  collection: { color: "var(--color-low)", icon: <Droplets size={14} />, label: "Collection" },
  conversion: { color: "var(--accent)", icon: <ShieldCheck size={14} />, label: "Recovery" },
  info: { color: "var(--text-tertiary)", icon: <Info size={14} />, label: "Info" },
};

const PORT_COORDS: Record<string, [number, number]> = {
  baku: [40.365, 49.855],
  sumgait: [40.59, 49.638],
  alyat: [39.958, 49.42],
  sangachal: [40.186, 49.492],
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
}

export default function ActivityFeed({ entries, onEventClick }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="panel" style={{ height: "100%" }}>
      <div className="panel-header">
        <span className="panel-title">Activity Feed</span>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Live ops stream</span>
      </div>

      <div className="panel-body" style={{ padding: "8px 8px 12px" }}>
        {sorted.map((entry, i) => {
          const meta = META[entry.type] ?? META.info;
          return (
            <div
              key={`${entry.timestamp}-${i}`}
              className="row-hover"
              onClick={() => {
                if (!onEventClick) return;
                const coords = PORT_COORDS[entry.portId] || PORT_COORDS.baku;
                onEventClick(coords[0], coords[1]);
              }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 12px",
                marginBottom: 2,
                borderLeft: `2px solid ${meta.color}`,
                cursor: onEventClick ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: `${meta.color}14`,
                  color: meta.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {meta.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    lineHeight: 1.4,
                    fontWeight: 500,
                    wordBreak: "break-word",
                  }}
                >
                  {entry.event}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 4,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>·</span>
                  <span>{timeAgo(entry.timestamp)}</span>
                  {entry.incidentId && (
                    <>
                      <span style={{ color: "var(--text-tertiary)" }}>·</span>
                      <span
                        style={{
                          fontFamily: "ui-monospace, monospace",
                          color: "var(--accent)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {entry.incidentId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
