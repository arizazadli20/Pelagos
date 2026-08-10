"use client";

import { useState } from "react";
import { mockData, getDashboardKpis } from "@/lib/mock-data";
import AppShell from "@/components/AppShell";
import MapPanel from "@/components/MapPanel";
import KpiCards from "@/components/KpiCards";
import RecentIncidents from "@/components/RecentIncidents";
import ActivityFeed from "@/components/ActivityFeed";

export default function DashboardPage() {
  const [activeMapCoords, setActiveMapCoords] = useState<[number, number] | null>(null);

  const incidents = mockData.incidents;
  const vessels = mockData.vessels;
  const riskZones = mockData.riskZones;
  const activity = mockData.activityLog;
  const kpis = getDashboardKpis(incidents);

  return (
    <AppShell active="dashboard">
      <div className="dashboard-scroll">
        <section className="dashboard-map-wrap" aria-label="Caspian Sea incident map">
          <MapPanel
            incidents={incidents}
            vessels={vessels}
            riskZones={riskZones}
            activeMapCoords={activeMapCoords}
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
    </AppShell>
  );
}
