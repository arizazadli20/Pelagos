"use client";

import { ResourceStatus } from "@/lib/mock-data";
import { ChevronDown, Users, Package, Ship } from "lucide-react";
import { useState } from "react";

type Props = {
  resources: ResourceStatus;
};

export default function ResourceStatusWidget({ resources }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Helper to color-code based on availability percentage
  const getProgressColor = (available: number, total: number) => {
    const pct = available / total;
    if (pct > 0.5) return "var(--color-low)"; // green
    if (pct > 0.2) return "var(--color-med)"; // yellow
    return "var(--color-high)"; // red
  };

  const boomAvailable = resources.boomTotalMeters - resources.boomDeployedMeters;
  const sorbentAvailable = resources.sorbentTotalKg - resources.sorbentReservedKg;
  const teamsAvailable = resources.teamsTotal - resources.teamsDeployed;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", overflowY: "auto" }}>
      
      {/* Boom Inventory */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={14} /> Boom Inventory
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
            {boomAvailable}m / {resources.boomTotalMeters}m
          </span>
        </div>
        <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ 
            height: "100%", 
            width: `${(boomAvailable / resources.boomTotalMeters) * 100}%`, 
            background: getProgressColor(boomAvailable, resources.boomTotalMeters) 
          }} />
        </div>
      </div>

      {/* Sorbent Stock */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Package size={14} /> Sorbent Stock
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
            {sorbentAvailable}kg / {resources.sorbentTotalKg}kg
          </span>
        </div>
        <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ 
            height: "100%", 
            width: `${(sorbentAvailable / resources.sorbentTotalKg) * 100}%`, 
            background: getProgressColor(sorbentAvailable, resources.sorbentTotalKg) 
          }} />
        </div>
      </div>

      {/* Response Teams */}
      <div style={{ marginBottom: "16px" }}>
        <div 
          onClick={() => setExpanded(!expanded)}
          style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", 
            cursor: "pointer", background: "var(--glass-bg)", padding: "8px", borderRadius: "6px",
            border: "1px solid var(--glass-border)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <Users size={14} /> Response Teams
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: getProgressColor(teamsAvailable, resources.teamsTotal) }}>
              {teamsAvailable} Available
            </span>
            <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>
        </div>
        {expanded && (
          <div style={{ padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: "0 0 6px 6px", marginTop: "-4px" }}>
            {resources.teams.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", padding: "4px 0" }}>
                <span style={{ color: "var(--text-primary)" }}>{t.name}</span>
                <span style={{ 
                  color: t.status === "Deployed" ? "var(--color-med)" : t.status === "Available" ? "var(--color-low)" : "var(--text-tertiary)"
                }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vessels */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "var(--glass-bg)", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <Ship size={14} /> Vessels Equipped
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }} title={resources.vesselsNames.join(", ")}>
          {resources.vesselsEquipped} Total
        </span>
      </div>

    </div>
  );
}
