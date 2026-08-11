"use client";

import { useEffect, useRef, useState } from "react";
import {
  CASPIAN_OVERVIEW,
  Incident,
  INCIDENT_STATUS_LABEL,
  RiskZone,
  Vessel,
  formatAreaM2,
} from "@/lib/mock-data";

type Props = {
  incidents: Incident[];
  vessels: Vessel[];
  riskZones: RiskZone[];
  activeMapCoords?: [number, number] | null;
  mapTheme?: "dark" | "light";
  onIncidentSelect?: (incident: Incident) => void;
};

function riskColor(risk: Incident["risk"]) {
  if (risk === "HIGH") return "#ef4444";
  if (risk === "MEDIUM") return "#f59e0b";
  return "#22c55e";
}

function createSpillIcon(L: any, active: boolean) {
  const size = active ? 12 : 10;
  const html = `
    <div style="position:relative;width:${size * 3.2}px;height:${size * 3.2}px;display:flex;align-items:center;justify-content:center;">
      ${
        active
          ? `<div style="
              position:absolute;top:50%;left:50%;
              width:${size * 2.8}px;height:${size * 2.8}px;
              border-radius:50%;
              border:1px solid rgba(239,68,68,0.45);
              transform:translate(-50%,-50%);
              animation:markerRing 2s ease-out infinite;
            "></div>`
          : ""
      }
      <div style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:#ef4444;
        border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,0.45);
        ${active ? "animation:markerPulse 2s ease-out infinite;" : ""}
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size * 3.2, size * 3.2],
    iconAnchor: [size * 1.6, size * 1.6],
  });
}

function createVesselIcon(L: any, heading: number) {
  const html = `
    <div style="
      width:14px;height:14px;
      transform:rotate(${heading}deg);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:11px solid #3b82f6;
        filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function makeIncidentPopup(inc: Incident) {
  const pct = Math.round(inc.aiProbability * 100);
  const risk = riskColor(inc.risk);
  return `
    <div style="padding:16px;font-family:'IBM Plex Sans',sans-serif;min-width:240px;">
      <div style="margin-bottom:4px;">
        <div style="font-size:13px;font-weight:700;color:#e8eef4;letter-spacing:0.04em;">
          INCIDENT ${inc.displayId}
        </div>
        <div style="font-size:12px;color:#8fa3b8;margin-top:3px;">${inc.location}</div>
      </div>

      <div style="height:1px;background:rgba(42,63,85,0.7);margin:12px 0;"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#5c738a;margin-bottom:4px;">Area</div>
          <div style="font-size:15px;font-weight:600;color:#e8eef4;font-variant-numeric:tabular-nums;">${formatAreaM2(inc.areaM2)}</div>
        </div>
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#5c738a;margin-bottom:4px;">AI Probability</div>
          <div style="font-size:15px;font-weight:600;color:#38bdf8;font-variant-numeric:tabular-nums;">${pct}%</div>
        </div>
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#5c738a;margin-bottom:4px;">Risk</div>
          <div style="font-size:13px;font-weight:700;color:${risk};letter-spacing:0.05em;">${inc.risk}</div>
        </div>
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#5c738a;margin-bottom:4px;">Status</div>
          <div style="font-size:13px;font-weight:600;color:#e8eef4;">${INCIDENT_STATUS_LABEL[inc.status].toUpperCase()}</div>
        </div>
      </div>

      <button type="button" class="popup-view-btn">View Incident</button>
    </div>
  `;
}

export default function MapPanel({
  incidents,
  vessels,
  riskZones,
  activeMapCoords,
  mapTheme = "dark",
  onIncidentSelect,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const onSelectRef = useRef(onIncidentSelect);
  onSelectRef.current = onIncidentSelect;

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    let mounted = true;

    import("leaflet").then(({ default: L }) => {
      if (!mounted || !mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [CASPIAN_OVERVIEW.lat, CASPIAN_OVERVIEW.lng],
        zoom: CASPIAN_OVERVIEW.zoom,
        zoomControl: false,
        scrollWheelZoom: true,
      });
      L.control.zoom({ position: "topleft" }).addTo(map);
      mapInst.current = map;

      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(mapRef.current);

      if (mounted) setLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInst.current || !loaded) return;
    const map = mapInst.current;

    import("leaflet").then(({ default: L }) => {
      if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
      const tileUrl =
        mapTheme === "light"
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      tileLayerRef.current = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);
      tileLayerRef.current.bringToBack();
    });
  }, [mapTheme, loaded]);

  useEffect(() => {
    if (!mapInst.current || !loaded) return;
    const map = mapInst.current;

    import("leaflet").then(({ default: L }) => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];

      // Risk zones — yellow/orange translucent
      riskZones.forEach((zone) => {
        const isHigh = zone.level === "high";
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radiusM,
          color: isHigh ? "#f59e0b" : "#eab308",
          fillColor: isHigh ? "#f59e0b" : "#eab308",
          fillOpacity: isHigh ? 0.14 : 0.1,
          weight: 1.25,
          opacity: 0.7,
        }).bindTooltip(zone.name, { direction: "top", opacity: 0.9 });
        circle.addTo(map);
        layersRef.current.push(circle);
      });

      // Oil spill markers — red
      incidents.forEach((inc, idx) => {
        const active = idx === 0 || inc.status === "detected" || inc.status === "under_review";
        const marker = L.marker([inc.lat, inc.lng], {
          icon: createSpillIcon(L, active && inc.status !== "resolved" && inc.status !== "rejected"),
          zIndexOffset: 600,
        });
        const popup = L.popup({ maxWidth: 300, minWidth: 250 }).setContent(makeIncidentPopup(inc));
        marker.bindPopup(popup);
        marker.on("popupopen", () => {
          const btn = document.querySelector(".popup-view-btn") as HTMLButtonElement | null;
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              onSelectRef.current?.(inc);
            };
          }
        });
        marker.on("click", () => {
          onSelectRef.current?.(inc);
        });
        marker.addTo(map);
        layersRef.current.push(marker);
      });

      // Vessel markers — blue
      vessels.forEach((v) => {
        const marker = L.marker([v.lat, v.lng], {
          icon: createVesselIcon(L, v.heading),
          zIndexOffset: 400,
        }).bindTooltip(
          `<strong>${v.name}</strong><br/>${v.type} · ${v.status}`,
          { direction: "top" }
        );
        marker.addTo(map);
        layersRef.current.push(marker);
      });
    });
  }, [incidents, vessels, riskZones, loaded]);

  useEffect(() => {
    if (activeMapCoords && mapInst.current && loaded) {
      mapInst.current.flyTo(activeMapCoords, 10, { animate: true, duration: 1.2 });
    }
  }, [activeMapCoords, loaded]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            className="spinner"
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid var(--glass-border)",
              borderTopColor: "var(--accent)",
            }}
          />
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Loading Caspian map…
          </span>
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 44,
          left: 12,
          zIndex: 1000,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid #fff",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
            Oil spill
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "9px solid #3b82f6",
              marginLeft: 1,
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
            Vessel
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "rgba(245,158,11,0.35)",
              border: "1px solid #f59e0b",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
            Risk zone
          </span>
        </div>
      </div>

      {/* Context strip */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 52,
          zIndex: 1000,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 8,
          padding: "8px 12px",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-primary)",
          }}
        >
          Caspian Sea Monitoring
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
          Sentinel-1 SAR · AI analysis · Human review
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 500,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 6,
          padding: "5px 10px",
          fontSize: 11,
          color: "var(--text-secondary)",
          fontVariantNumeric: "tabular-nums",
          pointerEvents: "none",
          backdropFilter: "blur(6px)",
        }}
      >
        {CASPIAN_OVERVIEW.lat.toFixed(2)}°N · {CASPIAN_OVERVIEW.lng.toFixed(2)}°E · OpenStreetMap
      </div>
    </div>
  );
}
