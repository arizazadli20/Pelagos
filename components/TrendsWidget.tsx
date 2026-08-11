"use client";

import { TrendData } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";

type Props = {
  data: TrendData[];
};

export default function TrendsWidget({ data }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-med)", lineHeight: 1 }}>
            {data[data.length - 1]?.cumulativeArea.toFixed(2)} <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>km² total</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-high)", lineHeight: 1, textAlign: "right" }}>
            {data[data.length - 1]?.incidentCount} <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>incidents</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-med)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-med)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
            
            <YAxis 
              yAxisId="left" 
              stroke="var(--text-tertiary)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val}km²`} 
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="var(--text-tertiary)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            
            <Tooltip 
              contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--glass-border)", borderRadius: "8px", fontSize: "12px" }}
              itemStyle={{ color: "var(--text-primary)" }}
              labelStyle={{ color: "var(--text-secondary)", marginBottom: "4px" }}
            />
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="cumulativeArea" 
              name="Cumulative Area"
              stroke="var(--color-med)" 
              fillOpacity={1} 
              fill="url(#colorArea)" 
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="incidentCount" 
              name="Incident Count"
              stroke="var(--color-high)" 
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-high)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
