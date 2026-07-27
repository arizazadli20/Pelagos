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

  if (!mounted || !isAuthenticated) return null;

  const detections = [...mockData.detections].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const activity = [...mockData.activityLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const widgets = [
    { id: "kpi",        content: <IncidentKpiWidget detections={detections} /> },
    { id: "riskzone",   content: <RiskZoneWidget detections={detections} /> },
    { id: "vessels",    content: <VesselsWidget vessels={mockData.vessels} port={selectedPort} /> },
    { id: "activity",   content: <ActivityFeed entries={activity} /> },
    { id: "conversion", content: <ConversionTracker entries={mockData.conversionLog} /> },
    { id: "history",    content: <HistoryTable detections={detections} /> },
    { id: "weather",    content: <SeaWeatherWidget port={selectedPort} /> },
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
            />
          </div>

          {/* Right — Widget grid (67%) */}
          <div
            className="dashboard-grid-col"
            style={{
              flex: 1,
              overflow: "auto",
              minWidth: 0,
            }}
          >
            <WidgetGrid widgets={widgets} />
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
            />
          </div>

          {/* Overlay UI */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", display: "flex", flexDirection: "column" }}>
            
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", padding: "16px", minHeight: 0 }}>
              
              {/* Left Dock */}
              <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "16px", pointerEvents: "auto" }}>
                <div style={{ height: "340px" }}>
                  <WidgetCard title="Incident KPIs" icon={<BarChart2 size={16} strokeWidth={2.5} />} dragHandleClass="">
                     <IncidentKpiWidget detections={detections} />
                  </WidgetCard>
                </div>
                {/* Sea & Weather — below KPI in left dock */}
                <div style={{ height: "220px" }}>
                  <WidgetCard title="Sea &amp; Weather" icon={<CloudSun size={16} strokeWidth={2.5} />} dragHandleClass="">
                    <SeaWeatherWidget port={selectedPort} />
                  </WidgetCard>
                </div>
              </div>

              {/* Right Dock */}
              <div style={{ width: "360px", display: "flex", flexDirection: "column", gap: "16px", pointerEvents: "auto" }}>
                <div style={{ height: "300px" }}>
                  <WidgetCard title="Risk Zone Breakdown" icon={<ShieldAlert size={16} strokeWidth={2.5} />} dragHandleClass="">
                     <RiskZoneWidget detections={detections} />
                  </WidgetCard>
                </div>
                <div style={{ flex: 1, minHeight: "250px" }}>
                  <WidgetCard title="AIS Vessels" icon={<Navigation size={16} strokeWidth={2.5} />} dragHandleClass="">
                     <VesselsWidget vessels={mockData.vessels} port={selectedPort} />
                  </WidgetCard>
                </div>
              </div>

            </div>

            {/* Bottom Dock */}
            <div style={{ display: "flex", gap: "16px", padding: "0 16px 16px", height: "380px", pointerEvents: "auto" }}>
              <div style={{ flex: 1 }}>
                <WidgetCard title="Activity Log" icon={<Activity size={16} strokeWidth={2.5} />} dragHandleClass="">
                   <ActivityFeed entries={activity} />
                </WidgetCard>
              </div>
              <div style={{ flex: 2 }}>
                <WidgetCard title="Circular Recovery" icon={<RefreshCw size={16} strokeWidth={2.5} />} dragHandleClass="">
                   <ConversionTracker entries={mockData.conversionLog} />
                </WidgetCard>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Account Button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          zIndex: 100,
          background: "var(--card-surface)",
          border: "1px solid var(--border-muted)",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 500,
          transition: "all 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.background = "var(--glass-bg-hover)"}
        onMouseOut={e => e.currentTarget.style.background = "var(--card-surface)"}
        title="Account Settings / Logout"
      >
        <LogOut size={16} />
        Account
      </button>

    </div>
  );
}
