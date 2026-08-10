"use client";

import { DashboardKpis, formatAreaM2 } from "@/lib/mock-data";
import {
  AlertTriangle,
  ShieldAlert,
  Maximize2,
  Droplets,
  Brain,
} from "lucide-react";

type Props = {
  kpis: DashboardKpis;
};

type CardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  accent?: string;
};

function KpiCard({ label, value, hint, icon, accent = "var(--accent)" }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--glass-border)",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${accent}18`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{hint}</div>
      )}
    </div>
  );
}

export default function KpiCards({ kpis }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: 12,
      }}
      className="kpi-grid"
    >
      <KpiCard
        label="Active Incidents"
        value={String(kpis.activeIncidents)}
        hint="Open cases across Caspian ops"
        icon={<AlertTriangle size={15} strokeWidth={2} />}
        accent="var(--color-high)"
      />
      <KpiCard
        label="High Risk"
        value={String(kpis.highRisk)}
        hint="Requires priority review"
        icon={<ShieldAlert size={15} strokeWidth={2} />}
        accent="var(--color-med)"
      />
      <KpiCard
        label="Detected Area"
        value={formatAreaM2(kpis.detectedAreaM2)}
        hint="Active spill footprint"
        icon={<Maximize2 size={15} strokeWidth={2} />}
        accent="var(--accent)"
      />
      <KpiCard
        label="Cleaned Area"
        value={formatAreaM2(kpis.cleanedAreaM2)}
        hint="Cleaning + resolved"
        icon={<Droplets size={15} strokeWidth={2} />}
        accent="var(--color-low)"
      />
      <KpiCard
        label="AI Confidence"
        value={`${Math.round(kpis.aiConfidence * 100)}%`}
        hint="Avg. model probability"
        icon={<Brain size={15} strokeWidth={2} />}
        accent="var(--accent)"
      />

      <style>{`
        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 700px) {
          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}
