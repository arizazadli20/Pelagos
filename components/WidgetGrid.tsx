"use client";

import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { ResponsiveGridLayout, LayoutItem, ResponsiveLayouts, verticalCompactor } from "react-grid-layout";
import { RotateCcw, Activity, ShieldAlert, Navigation, RefreshCw, History, BarChart2, Edit2, Check, CloudSun, Package, TrendingUp } from "lucide-react";
import WidgetCard from "./WidgetCard";

const STORAGE_KEY  = "seaseatry-dashboard-layout-v3";
const DRAG_HANDLE  = "widget-header";

/** Default 12-column layout */
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "kpi",        x: 0,  y: 0,  w: 4,  h: 5,  minW: 3, maxW: 12, minH: 4 },
  { i: "riskzone",   x: 4,  y: 0,  w: 4,  h: 5,  minW: 3, maxW: 12, minH: 4 },
  { i: "vessels",    x: 8,  y: 0,  w: 4,  h: 5,  minW: 3, maxW: 12, minH: 4 },
  { i: "activity",   x: 0,  y: 5,  w: 4,  h: 6,  minW: 3, maxW: 12, minH: 5 },
  { i: "conversion", x: 4,  y: 5,  w: 8,  h: 7,  minW: 4, maxW: 12, minH: 6 },
  { i: "history",    x: 0,  y: 12, w: 12, h: 6,  minW: 6, maxW: 12, minH: 5 },
  { i: "weather",    x: 0,  y: 18, w: 4,  h: 5,  minW: 4, maxW: 12, minH: 5 },
  { i: "resources",  x: 4,  y: 18, w: 4,  h: 5,  minW: 4, maxW: 12, minH: 5 },
  { i: "trends",     x: 8,  y: 18, w: 4,  h: 5,  minW: 4, maxW: 12, minH: 5 },
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  lg:  DEFAULT_LAYOUT,
  md:  DEFAULT_LAYOUT.map(l => ({ ...l, w: Math.min(l.w, 10) })),
  sm:  DEFAULT_LAYOUT.map(l => ({ ...l, x: 0, w: 6 })),
  xs:  DEFAULT_LAYOUT.map(l => ({ ...l, x: 0, w: 4 })),
  xxs: DEFAULT_LAYOUT.map(l => ({ ...l, x: 0, w: 2 })),
};

const WIDGET_TITLES: Record<string, string> = {
  kpi:        "Incident KPIs",
  riskzone:   "Risk Zone Breakdown",
  vessels:    "AIS Vessels",
  activity:   "Activity Log",
  conversion: "Circular Recovery",
  history:    "Detection History",
  weather:    "Sea & Weather",
  resources:  "Resource Status",
  trends:     "Analytics & Trends",
};

const WIDGET_ICONS: Record<string, ReactNode> = {
  kpi:        <BarChart2 size={16} strokeWidth={2.5} />,
  riskzone:   <ShieldAlert size={16} strokeWidth={2.5} />,
  vessels:    <Navigation size={16} strokeWidth={2.5} />,
  activity:   <Activity size={16} strokeWidth={2.5} />,
  conversion: <RefreshCw size={16} strokeWidth={2.5} />,
  history:    <History size={16} strokeWidth={2.5} />,
  weather:    <CloudSun size={16} strokeWidth={2.5} />,
  resources:  <Package size={16} strokeWidth={2.5} />,
  trends:     <TrendingUp size={16} strokeWidth={2.5} />,
};

export type WidgetDef = {
  id: string;
  content: ReactNode;
  updatedAt?: string;
};

type Props = {
  widgets: WidgetDef[];
  editMode?: boolean;
  resetSignal?: number;
};

export default function WidgetGrid({ widgets, editMode = false, resetSignal = 0 }: Props) {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);
  const [width, setWidth]     = useState(800);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage on client mount only
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLayouts(JSON.parse(saved) as ResponsiveLayouts);
    } catch { /* corrupt — use defaults */ }
  }, []);

  // Measure container width using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 800;
      setWidth(w);
      setIsMobile(w < 768);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [mounted]);

  const handleLayoutChange = useCallback((layout: readonly LayoutItem[], all: ResponsiveLayouts) => {
    void layout;
    setLayouts(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* storage full */ }
  }, []);

  const handleReset = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (resetSignal > 0) {
      handleReset();
    }
  }, [resetSignal, handleReset]);

  const widgetMap = Object.fromEntries(widgets.map(w => [w.id, w]));

  // Skip SSR — avoid layout/width hydration mismatch
  if (!mounted) return null;

  return (
    <div ref={containerRef} style={{ position: "relative" }} data-edit-mode={editMode ? "true" : "false"}>
      <ResponsiveGridLayout
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        width={width}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={72}
        margin={[16, 16]}
        containerPadding={[16, 8]}
        /* Use the library's vertical compactor so widgets pack downward
           and cannot overlap — equivalent to compactType="vertical" */
        compactor={verticalCompactor}
        dragConfig={{ handle: `.${DRAG_HANDLE}`, enabled: editMode && !isMobile }}
        resizeConfig={{ handles: ["se"], enabled: editMode && !isMobile }}
      >
        {DEFAULT_LAYOUT.map(({ i }) => {
          const widget = widgetMap[i];
          if (!widget) return null;
          return (
            <div key={i}>
              <WidgetCard
                title={WIDGET_TITLES[i] ?? i}
                icon={WIDGET_ICONS[i]}
                dragHandleClass={DRAG_HANDLE}
                editMode={editMode}
                updatedAt={widget.updatedAt}
              >
                {widget.content}
              </WidgetCard>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
