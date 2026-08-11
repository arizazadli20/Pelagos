"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import MapPanel from "@/components/MapPanel";
import KpiCards from "@/components/KpiCards";
import RecentIncidents from "@/components/RecentIncidents";
import ActivityFeed from "@/components/ActivityFeed";
import IncidentDetailsPanel from "@/components/incidents/IncidentDetailsPanel";
import { useIncidentStore } from "@/lib/incident-store";
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
        <section className="dashboard-map-wrap" aria-label="Caspian Sea incident map">
          <MapPanel
            incidents={incidents}
            vessels={mapVessels}
            riskZones={riskZones}
            activeMapCoords={activeMapCoords}
            onIncidentSelect={setSelected}
          />
        </section>

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
