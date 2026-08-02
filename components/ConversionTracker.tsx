"use client";

import { ConversionEntry } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Props = { entries: ConversionEntry[] };

export default function ConversionTracker({ entries }: Props) {
  const totals = entries.reduce(
    (a, e) => ({ col: a.col + e.sorbentCollectedKg, conv: a.conv + e.convertedKg, bit: a.bit + e.bitumenModifierKg, ac: a.ac + e.activatedCarbonKg }),
    { col: 0, conv: 0, bit: 0, ac: 0 }
  );
  const pct = Math.round((totals.conv / totals.col) * 100);

  const data = [
    { name: "Converted", value: pct, color: "var(--accent-teal)" },
    { name: "Pending", value: 100 - pct, color: "rgba(255, 255, 255, 0.05)" }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "12px 16px" }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0", marginBottom: "8px", background: "var(--glass-bg)", borderRadius: "8px", padding: "10px", border: "1px solid var(--glass-border)", flexShrink: 0 }}>
        {[
          { l: "Collected",  v: `${totals.col.toLocaleString()} kg`, c: "var(--text-primary)" },
          { l: "Converted",  v: `${totals.conv.toLocaleString()} kg`, c: "var(--text-primary)" },
          { l: "Bitumen",    v: `${totals.bit.toLocaleString()} kg`, c: "var(--text-secondary)" },
          { l: "Activated C", v: `${totals.ac.toLocaleString()} kg`, c: "var(--text-secondary)" },
        ].map((s, i) => (
          <div key={s.l} style={{ paddingLeft: i > 0 ? "12px" : 0, borderLeft: i > 0 ? "1px solid var(--glass-border)" : "none" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: s.c, fontVariantNumeric: "tabular-nums" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Radial Gauge — semicircle with text safely below the arc */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", minHeight: "160px", position: "relative" }}>
        {/*
          We render the semicircle gauge in the upper ~60% of this area,
          then place the text below it so nothing overlaps the SVG stroke.
          cy="80%" ensures the arc midpoint is near the bottom of the chart
          container, so the full semicircle fits without clipping.
        */}
        <div style={{ width: "100%", flex: 1, minHeight: "120px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius="60%"
                outerRadius="80%"
                dataKey="value"
                stroke="none"
                cornerRadius={4}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--bg-base)", border: "1px solid var(--glass-border)", borderRadius: "8px", color: "var(--text-primary)" }}
                itemStyle={{ color: "var(--text-secondary)" }}
                formatter={(val: any) => [`${val}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Percentage text — sits below the arc, never overlapping it */}
        <div style={{
          textAlign: "center",
          paddingTop: "16px",
          paddingBottom: "8px",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: "38px",
            fontWeight: 300,
            color: "var(--accent-teal)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: "0 0 16px rgba(94, 234, 212, 0.2)",
          }}>
            {pct}%
          </div>
          <div style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: "8px",
          }}>
            Recovery Rate
          </div>
        </div>
      </div>
    </div>
  );
}
