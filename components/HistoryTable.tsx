"use client";

import { Detection } from "@/lib/mock-data";

type Props = { detections: Detection[] };

function portName(id: string) {
  return id === "baku" ? "Baku Port" : id === "sumgait" ? "Sumgait Port" : "Alyat Port";
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(ts: string) {
  const d = new Date(ts);
  const hh = String(d.getUTCHours()).padStart(2,"0");
  const mm = String(d.getUTCMinutes()).padStart(2,"0");
  return `${hh}:${mm} UTC`;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  detected:   { label: "Detected",   cls: "pill pill-detected" },
  alert_sent: { label: "Alert Sent", cls: "pill pill-alert" },
  collected:  { label: "Collected",  cls: "pill pill-collected" },
  converted:  { label: "Converted",  cls: "pill pill-converted" },
};

const REPORT_STATUS: Record<string, string> = {
  Pending: "var(--color-med)",
  Sent: "var(--text-secondary)",
  Acknowledged: "var(--accent-teal)",
};

export default function HistoryTable({ detections }: Props) {
  return (
    <div>

      <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "8px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1.4fr 1.1fr 75px 75px 65px 100px 90px",
          padding: "10px 16px",
          borderBottom: "1px solid var(--glass-border)",
          background: "var(--bg-base)",
        }}>
          {["Incident ID", "Date", "Port", "Conf", "Area", "Alert", "Status", "Report"].map(h => (
            <span key={h} style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {detections.map((det, i) => {
          const conf = Math.round(det.confidenceScore * 100);
          const sm   = STATUS[det.status] ?? STATUS.detected;
          return (
            <div
              key={det.id}
              className="row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1.4fr 1.1fr 75px 75px 65px 100px 90px",
                padding: "11px 16px",
                borderBottom: i < detections.length - 1 ? "1px solid var(--glass-border-light)" : "none",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--text-primary)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {(det as any).incidentId || det.id}
              </div>

              <div>
                <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{fmtDate(det.timestamp)}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{fmtTime(det.timestamp)}</div>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{portName(det.portId)}</div>

              <div style={{
                fontSize: "13px",
                fontWeight: 600,
                color: conf >= 90 ? "var(--color-low)" : conf >= 80 ? "var(--text-primary)" : "var(--color-med)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {conf}%
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                {det.areaKm2} km²
              </div>

              <div style={{
                fontSize: "13px",
                fontWeight: 500,
                color: det.alertLatencyMin <= 15 ? "var(--color-low)" : det.alertLatencyMin <= 25 ? "var(--text-secondary)" : "var(--color-med)",
                fontVariantNumeric: "tabular-nums",
              }}>
                +{det.alertLatencyMin}m
              </div>

              <span className={sm.cls}>{sm.label}</span>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: REPORT_STATUS[(det as any).reportStatus] || "var(--text-secondary)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{(det as any).reportStatus || "Pending"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
