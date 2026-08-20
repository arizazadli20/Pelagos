"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import MapPanel from "@/components/MapPanel";
import KpiCards from "@/components/KpiCards";
import RecentIncidents from "@/components/RecentIncidents";
import ActivityFeed from "@/components/ActivityFeed";
import SeaWeatherWidget from "@/components/SeaWeatherWidget";
import IncidentDetailsPanel from "@/components/incidents/IncidentDetailsPanel";
import { useIncidentStore } from "@/lib/incident-store";
import { mockData } from "@/lib/mock-data";
import type { Incident } from "@/lib/types";

export default function DashboardPage() {
  return (
    <AppShell active="dashboard">
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { incidents, vessels, riskZones, activity, kpis } = useIncidentStore();
  const [activeMapCoords, setActiveMapCoords] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [weatherPortId, setWeatherPortId] = useState(mockData.ports[0].id);
  const weatherPort =
    mockData.ports.find((p) => p.id === weatherPortId) || mockData.ports[0];

  const mapVessels = vessels.map((v) => ({
    id: v.id,
    name: v.name,
    portId: v.portId,
    lat: v.lat,
    lng: v.lng,
    distanceKm: 0,
    speedKnots: v.speedKnots,
    heading: v.heading,
    status: (v.status === "Suspicious" || v.status === "Response"
      ? "Transiting"
      : v.status) as "In port" | "Approaching" | "Transiting",
    type: v.type,
  }));

  return (
    <>
      <div className="dashboard-scroll">
        <div className="dashboard-map-row">
          <section className="dashboard-map-wrap" aria-label="Caspian Sea incident map">
            <MapPanel
              incidents={incidents}
              vessels={mapVessels}
              riskZones={riskZones}
              activeMapCoords={activeMapCoords}
              onIncidentSelect={setSelected}
            />
          </section>

          <section
            className="panel dashboard-weather-panel"
            aria-label="Live sea and wind conditions"
          >
            <div className="panel-header">
              <span className="panel-title">Sea &amp; Weather</span>
              <select
                value={weatherPortId}
                onChange={(e) => setWeatherPortId(e.target.value)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 11,
                  padding: "4px 8px",
                  outline: "none",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {mockData.ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="panel-body">
              <SeaWeatherWidget port={weatherPort} />
            </div>
          </section>
        </div>

        <section aria-label="Key performance indicators">
          <KpiCards kpis={kpis} />
        </section>

        <section className="dashboard-lower" aria-label="Incidents and activity">
          <RecentIncidents incidents={incidents} />
          <ActivityFeed
            entries={activity}
            onEventClick={(lat, lng) => setActiveMapCoords([lat, lng])}
          />
        </section>
      </div>

      <IncidentDetailsPanel incident={selected} onClose={() => setSelected(null)} />
    </>
  );
}
