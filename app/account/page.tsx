"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockData, Port } from "@/lib/mock-data";

import Header, { LayoutMode } from "@/components/Header";
import StageTracker       from "@/components/StageTracker";
import MapPanel           from "@/components/MapPanel";
import WidgetGrid         from "@/components/WidgetGrid";
import IncidentKpiWidget  from "@/components/IncidentKpiWidget";
import RiskZoneWidget     from "@/components/RiskZoneWidget";
import VesselsWidget      from "@/components/VesselsWidget";
import ActivityFeed       from "@/components/ActivityFeed";
import ConversionTracker  from "@/components/ConversionTracker";
import HistoryTable       from "@/components/HistoryTable";
import SeaWeatherWidget   from "@/components/SeaWeatherWidget";
import WidgetCard         from "@/components/WidgetCard";
import { BarChart2, ShieldAlert, Navigation, Activity, RefreshCw, LogOut, CloudSun } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth check
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("peykgoz-auth") !== "true") {
      router.push("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const [selectedPort, setSelectedPort] = useState<Port>(mockData.ports[0]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [mapTheme, setMapTheme] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [activeMapCoords, setActiveMapCoords] = useState<[number, number] | null>(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [alerts, setAlerts] = useState(mockData.alerts);

  useEffect(() => {
    const savedLayout = localStorage.getItem('peykgoz-layout-mode');
    if (savedLayout === 'immersive' || savedLayout === 'grid') setLayoutMode(savedLayout as LayoutMode);

    const savedTheme = localStorage.getItem('peykgoz-map-theme');
    if (savedTheme) setMapTheme(savedTheme as any);
  }, []);

  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('peykgoz-layout-mode', mode);
  };

  const handleThemeChange = (t: any) => {
    setMapTheme(t);
    localStorage.setItem('peykgoz-map-theme', t);
  };

  const handleLogout = () => {
    localStorage.removeItem("peykgoz-auth");
    router.push("/");
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  if (!mounted || !isAuthenticated) return null;

  const detections = [...mockData.detections].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const activity = [...mockData.activityLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Mock last update times (e.g. 1-5 minutes ago)
  const now = new Date();
  const mockUpdatedAt = new Date(now.getTime() - 1000 * 60 * 2).toISOString();

  const widgets = [
    { id: "kpi",        content: <IncidentKpiWidget detections={detections} />, updatedAt: mockUpdatedAt },
    { id: "riskzone",   content: <RiskZoneWidget detections={detections} />, updatedAt: mockUpdatedAt },
    { id: "vessels",    content: <VesselsWidget vessels={mockData.vessels} port={selectedPort} />, updatedAt: mockUpdatedAt },
    { id: "activity",   content: <ActivityFeed entries={activity} onEventClick={(lat, lng) => setActiveMapCoords([lat, lng])} />, updatedAt: mockUpdatedAt },
    { id: "conversion", content: <ConversionTracker entries={mockData.conversionLog} />, updatedAt: mockUpdatedAt },
    { id: "history",    content: <HistoryTable detections={detections} />, updatedAt: mockUpdatedAt },
    { id: "weather",    content: <SeaWeatherWidget port={selectedPort} />, updatedAt: mockUpdatedAt },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      
      {/* ── Header ── */}
      <Header
        ports={mockData.ports}
        selectedPort={selectedPort}
        onPortChange={setSelectedPort}
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        mapTheme={mapTheme}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
        isSatelliteView={isSatelliteView}
        onSatelliteToggle={() => setIsSatelliteView(!isSatelliteView)}
        editMode={editMode}
        onEditToggle={() => setEditMode(!editMode)}
        onResetLayout={() => setResetSignal(r => r + 1)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      {layoutMode === 'grid' ? (
        /* ── Mode A: Split Grid ── */
        <div
          className="dashboard-split"
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
            position: "relative",
            zIndex: 10
          }}
        >
          {/* Left — Map panel (33%) */}
          <div
            className="dashboard-map-col"
            style={{
              width: "33.333%",
              flexShrink: 0,
              borderRight: "1px solid var(--glass-border)",
              overflow: "hidden",
              boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
              pointerEvents: "auto"
            }}
          >
            <MapPanel
              port={selectedPort}
              ports={mockData.ports}
              detections={detections}
              onPortChange={setSelectedPort}
              mapTheme={mapTheme}
              activeMapCoords={activeMapCoords}
              isSatelliteView={isSatelliteView}
            />
          </div>

          {/* Right — Widget grid (67%) */}
          <div
            className="dashboard-grid-col"
            style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}
          >
            <WidgetGrid widgets={widgets} editMode={editMode} resetSignal={resetSignal} />
          </div>
        </div>
      ) : (
        /* ── Mode B: Immersive Overlay ── */
        <div style={{ flex: 1, position: "relative" }}>
          
          {/* Background Full-Bleed Map */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
            <MapPanel
              port={selectedPort}
              ports={mockData.ports}
              detections={detections}
              onPortChange={setSelectedPort}
              hideHeader={true}
              mapTheme={mapTheme}
              activeMapCoords={activeMapCoords}
              isSatelliteView={isSatelliteView}
            />
          </div>

          {/* Overlay UI */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", display: "flex", flexDirection: "column" }}>
            
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", padding: "16px", minHeight: 0 }}>
              
              {/* Left Dock */}
              <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "16px", pointerEvents: "auto" }}>
                <div style={{ height: "340px" }}>
                  <WidgetCard title="Incident KPIs" icon={<BarChart2 size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                     <IncidentKpiWidget detections={detections} />
                  </WidgetCard>
                </div>
                {/* Sea & Weather — below KPI in left dock */}
                <div style={{ height: "220px" }}>
                  <WidgetCard title="Sea & Weather" icon={<CloudSun size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                    <SeaWeatherWidget port={selectedPort} />
                  </WidgetCard>
                </div>
              </div>

              {/* Right Dock */}
              <div style={{ width: "360px", display: "flex", flexDirection: "column", gap: "16px", pointerEvents: "auto" }}>
                <div style={{ height: "300px" }}>
                  <WidgetCard title="Risk Zone Breakdown" icon={<ShieldAlert size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                     <RiskZoneWidget detections={detections} />
                  </WidgetCard>
                </div>
                <div style={{ flex: 1, minHeight: "250px" }}>
                  <WidgetCard title="AIS Vessels" icon={<Navigation size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                     <VesselsWidget vessels={mockData.vessels} port={selectedPort} />
                  </WidgetCard>
                </div>
              </div>

            </div>

            {/* Bottom Dock */}
            <div style={{ display: "flex", gap: "16px", padding: "0 16px 16px", height: "380px", pointerEvents: "auto" }}>
              <div style={{ flex: 1 }}>
                <WidgetCard title="Activity Log" icon={<Activity size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                   <ActivityFeed entries={activity} onEventClick={(lat, lng) => setActiveMapCoords([lat, lng])} />
                </WidgetCard>
              </div>
              <div style={{ flex: 2 }}>
                <WidgetCard title="Circular Recovery" icon={<RefreshCw size={16} strokeWidth={2.5} />} dragHandleClass="" updatedAt={mockUpdatedAt}>
                   <ConversionTracker entries={mockData.conversionLog} />
                </WidgetCard>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
