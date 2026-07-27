"use client";

import { Detection } from "@/lib/mock-data";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

type Props = { detections: Detection[] };

const COLORS = {
  High:   "var(--color-high)",
  Medium: "var(--color-med)",
  Low:    "var(--color-low)",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
      backdropFilter: "blur(8px)"
    }}>
      <span style={{ color: COLORS[name as keyof typeof COLORS] }}>{name} Risk</span>
      <span style={{ color: "var(--text-primary)", marginLeft: "10px", fontWeight: 600 }}>{value} incident{value !== 1 ? "s" : ""}</span>
    </div>
  );
};

const CenterLabel = ({ cx, cy, total }: { cx: number; cy: number; total: number }) => (
  <g>
    <text x={cx} y={cy - 6}  textAnchor="middle" fill="var(--text-primary)" fontSize={26} fontWeight={700} fontFamily="Inter, sans-serif">
      {total}
    </text>
    <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-secondary)"    fontSize={11} fontFamily="Inter, sans-serif">
      total
    </text>
  </g>
);

export default function RiskZoneWidget({ detections }: Props) {
  const high   = detections.filter(d => d.confidenceScore >= 0.90).length;
  const medium = detections.filter(d => d.confidenceScore >= 0.75 && d.confidenceScore < 0.90).length;
  const low    = detections.filter(d => d.confidenceScore < 0.75).length;
  const total  = detections.length;

  const data = [
    { name: "High",   value: high   },
    { name: "Medium", value: medium },
    { name: "Low",    value: low    },
  ].filter(d => d.value > 0);

  // SVG CenterLabel needs actual pixel coords, so we use percentage layout in Recharts
  // However, Recharts passes cx/cy automatically to custom label. Wait, we put it manually.
  // Actually, we can use a custom label for Pie or absolute positioning.
  
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "8px 4px" }}>
      <div style={{ position: "relative", flex: 1, minHeight: "140px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              labelLine={false}
              stroke="none"
            >
              {data.map(entry => (
                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Absolute positioned center label to avoid SVG coord issues with CSS vars */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>total</div>
        </div>
      </div>

      {/* Legend rows */}
      <div style={{ padding: "8px 16px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { label: "High Risk",   count: high,   color: COLORS.High,   desc: "conf ≥ 90%" },
          { label: "Medium Risk", count: medium, color: COLORS.Medium, desc: "conf 75–89%" },
          { label: "Low Risk",    count: low,    color: COLORS.Low,    desc: "conf < 75%" },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            {/* Color dot */}
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: row.color, flexShrink: 0 }} />
            {/* Label — grows, truncates if narrow */}
            <span style={{
              fontSize: "12px",
              color: "var(--text-primary)",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingRight: "4px",
            }}>{row.label}</span>
            {/* Descriptor — fixed-width, never overlaps label */}
            <span style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              flexShrink: 0,
              minWidth: "72px",
              textAlign: "right",
              whiteSpace: "nowrap",
            }}>{row.desc}</span>
            {/* Count — fixed-width right column */}
            <span style={{
              fontSize: "13px",
              fontWeight: 600,
              color: row.color,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
              minWidth: "24px",
              textAlign: "right",
              paddingLeft: "6px",
            }}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
