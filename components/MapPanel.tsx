"use client";

import { useEffect, useRef, useState } from "react";
import { Detection, Port } from "@/lib/mock-data";
import { motion } from "framer-motion";

type Props = {
  port: Port;
  ports: Port[];
  detections: Detection[];
  onPortChange: (port: Port) => void;
  hideHeader?: boolean;
  mapTheme?: 'dark' | 'light' | 'satellite';
  activeMapCoords?: [number, number] | null;
  isSatelliteView?: boolean;
};

function spillPolygon(det: Detection): [number, number][] {
  const r = Math.sqrt(det.areaKm2) * 0.0044;
  return [
    [det.lat + r * 0.55, det.lng - r * 0.95],
    [det.lat + r * 0.95, det.lng + r * 0.25],
    [det.lat + r * 0.30, det.lng + r * 1.05],
    [det.lat - r * 0.50, det.lng + r * 0.85],
    [det.lat - r * 0.95, det.lng - r * 0.15],
    [det.lat - r * 0.20, det.lng - r * 1.10],
  ];
}

function fmtUTC(ts: string) {
  const d = new Date(ts);
  return d.toUTCString().slice(5, 22) + " UTC";
}

function createIcon(L: any, isActive: boolean) {
  const color = isActive ? "var(--color-low)" : "var(--text-secondary)";
  const size  = isActive ? 10 : 7;
  const html  = `
    <div style="position:relative;width:${size * 4}px;height:${size * 4}px;display:flex;align-items:center;justify-content:center;">
      ${isActive ? `
        <div style="
          position:absolute;top:50%;left:50%;
          width:${size * 3.5}px;height:${size * 3.5}px;
          border-radius:50%;
          border:1px solid ${color}44;
          transform:translate(-50%,-50%);
          animation:markerRing 2s ease-out infinite;
        "></div>
      ` : ""}
      <div style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color};
        border:2px solid ${isActive ? "#fff" : "var(--border-muted)"};
        ${isActive ? "animation:markerPulse 2s ease-out infinite;" : ""}
      "></div>
    </div>
  `;
  return L.divIcon({ html, className: "", iconSize: [size * 4, size * 4], iconAnchor: [size * 2, size * 2] });
}

function makePopup(det: Detection) {
  const conf = Math.round(det.confidenceScore * 100);
  const statusLabel = det.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  return `
    <div style="padding:16px;font-family:Inter,-apple-system,sans-serif;min-width:240px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <div style="width:6px;height:6px;border-radius:50%;background:var(--color-low);flex-shrink:0;"></div>
        <span style="font-size:12px;font-weight:600;color:var(--text-primary);">Active Spill · ${det.id.toUpperCase()}</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:3px;">Confidence</div>
          <div style="font-size:28px;font-weight:700;color:${conf >= 90 ? "var(--color-low)" : "var(--text-primary)"};line-height:1;font-variant-numeric:tabular-nums;">${conf}%</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:3px;">Est. Area</div>
          <div style="font-size:28px;font-weight:700;color:var(--text-primary);line-height:1;font-variant-numeric:tabular-nums;">${det.areaKm2}</div>
          <div style="font-size:11px;color:var(--text-secondary);">km²</div>
        </div>
      </div>

      <div style="background:var(--bg-base);border:1px solid var(--glass-border);border-radius:6px;padding:10px;margin-bottom:10px;">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:3px;">Detected</div>
        <div style="font-size:12px;color:var(--text-primary);font-family:monospace;">${fmtUTC(det.timestamp)}</div>
      </div>

      <div style="background:rgba(34, 197, 94, 0.1);border:1px solid rgba(34, 197, 94, 0.2);border-radius:6px;padding:10px;">
        <div style="font-size:11px;color:var(--color-low);margin-bottom:2px;">Response time</div>
        <div style="font-size:13px;color:var(--text-primary);">Alert sent <strong style="color:var(--color-low);">+${det.alertLatencyMin} min</strong> after image acquisition</div>
      </div>

      <div style="margin-top:10px;font-size:11px;color:var(--text-secondary);">Status: <span style="color:var(--text-primary);">${statusLabel}</span></div>
    </div>
  `;
}

export default function MapPanel({ port, ports, detections, onPortChange, hideHeader = false, mapTheme = 'dark', activeMapCoords, isSatelliteView = false }: Props) {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polys   = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const wmsLayerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/copernicus-token');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API Failed! Status: ${res.status}, Details: ${errorText}`);
        }
        const data = await res.json();
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("Error fetching Sentinel token from API:", err);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    let mounted = true;
    import("leaflet").then(({ default: L }) => {
      if (!mounted || !mapRef.current) return;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current!, {
        center: [port.lat, port.lng],
        zoom: 13,
        zoomControl: false, // We'll reposition it via CSS or keep default top-left
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
      });
      L.control.zoom({ position: 'topleft' }).addTo(map);
      
      mapInst.current = map;
      
      // Auto-resize observer to fix Immersive mode gaps
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(mapRef.current);

      if (mounted) setLoaded(true);
    });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle base tile theme (dark/light) — completely independent of WMS
  useEffect(() => {
    if (!mapInst.current || !loaded) return;
    const map = mapInst.current;

    import("leaflet").then(({ default: L }) => {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      const tileUrl =
        mapTheme === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, zIndex: 1 }).addTo(map);
      tileLayerRef.current.bringToBack();
    });
  }, [mapTheme, loaded]);

  // Handle Sentinel-1 WMS satellite overlay — only fires when token or toggle changes
  useEffect(() => {
    if (!mapInst.current || !loaded) return;
    const map = mapInst.current;

    import("leaflet").then(({ default: L }) => {
      // Always clean up any existing WMS layer first
      if (wmsLayerRef.current) {
        map.removeLayer(wmsLayerRef.current);
        wmsLayerRef.current = null;
      }

      // Only add the layer when both conditions are met — no race condition
      if (isSatelliteView && accessToken) {
        wmsLayerRef.current = L.tileLayer.wms(
          `https://sh.dataspace.copernicus.eu/ogc/wms/0893532d-be92-488c-8857-e4af303e74fc?AUTHORIZATION=Bearer%20${accessToken}`,
          {
            layers: 'IW_VV',
            format: 'image/png',
            transparent: true,
            time: '2026-07-01/2026-08-05',
            attribution: '&copy; Copernicus Sentinel Data',
            zIndex: 9999,
            crossOrigin: 'anonymous',
          } as any
        ).addTo(map);
      }
    });
  }, [isSatelliteView, accessToken, loaded]);

  // Handle markers
  useEffect(() => {
    if (!mapInst.current || !loaded) return;
    const map = mapInst.current;
    markers.current.forEach(m => map.removeLayer(m));
    polys.current.forEach(p   => map.removeLayer(p));
    markers.current = [];
    polys.current   = [];
    map.setView([port.lat, port.lng], 13, { animate: true, duration: 0.6 });

    import("leaflet").then(({ default: L }) => {
      detections.filter(d => d.portId === port.id).forEach((det, idx) => {
        const isActive = idx === 0;

        const poly = L.polygon(spillPolygon(det), {
          color:       isActive ? "var(--color-low)" : "var(--border-muted)",
          fillColor:   isActive ? "var(--color-low)" : "var(--bg-base)",
          fillOpacity: isActive ? 0.08 : 0.04,
          weight:      isActive ? 1.5 : 0.8,
          dashArray:   isActive ? undefined : "4 6",
        }).addTo(map);
        polys.current.push(poly);

        const marker = L.marker([det.lat, det.lng], { icon: createIcon(L, isActive) });
        marker.bindPopup(L.popup({ maxWidth: 300, minWidth: 260 }).setContent(makePopup(det)));
        marker.addTo(map);
        markers.current.push(marker);

        if (isActive) setTimeout(() => marker.openPopup(), 400);
      });
    });
  }, [port, detections, loaded]);

  // Handle cross-component flyTo
  useEffect(() => {
    if (activeMapCoords && mapInst.current && loaded) {
      mapInst.current.flyTo(activeMapCoords, 14, { animate: true, duration: 1.5 });
    }
  }, [activeMapCoords, loaded]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>

      {/* In-panel location switcher */}
      {!hideHeader && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "var(--glass-bg)",
          borderBottom: "1px solid var(--glass-border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="5" r="2" stroke="var(--text-secondary)" strokeWidth="1.2"/>
              <path d="M6 1C3.79 1 2 2.79 2 5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="var(--text-secondary)" strokeWidth="1.2" fill="none"/>
            </svg>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Location
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            <div style={{ position: "relative" }}>
            <select
              id="map-port-selector"
              value={port.id}
              onChange={e => {
                const p = ports.find(x => x.id === e.target.value);
                if (p) onPortChange(p);
              }}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "6px",
                color: "var(--text-primary)",
                fontSize: "12px",
                padding: "4px 28px 4px 10px",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              {ports.map(p => (
                <option key={p.id} value={p.id} style={{ background: "var(--bg-base)" }}>
                  {p.name}
                </option>
              ))}
            </select>
            <svg
              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </div>
          </div>
        </div>
      )}

      {/* Map container — fills remaining height */}
      <div style={{ position: "absolute", inset: (hideHeader ? 0 : "44px 0 0 0"), zIndex: 0, pointerEvents: "auto" }}>
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}>
            <div className="spinner" style={{
              width: "16px", height: "16px",
              borderRadius: "50%",
              border: "2px solid var(--glass-border)",
              borderTopColor: "var(--text-primary)",
            }}/>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Loading map…</span>
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%", pointerEvents: "auto" }} />



        {/* Map Legend Overlay */}
        <div style={{
          position: "absolute",
          bottom: "60px",
          left: "12px",
          zIndex: 1000,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "16px", height: "0", borderBottom: "2px dashed #ff004c" }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Oil Spill</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid #fff", background: "var(--color-low)", marginLeft: "2px", marginRight: "2px" }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cleaned / Deployed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", marginLeft: "4px", marginRight: "4px" }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vessel</span>
          </div>
        </div>

        {/* Coords overlay */}
        <div style={{
          position: "absolute", bottom: "12px", left: "12px", zIndex: 500,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "6px",
          padding: "6px 12px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          fontSize: "11px",
          color: "var(--text-secondary)",
          fontFamily: "monospace",
          pointerEvents: "none",
          backdropFilter: "blur(4px)"
        }}>
          <span>{port.lat.toFixed(4)}°N</span>
          <span style={{ color: "var(--border-muted)" }}>|</span>
          <span>{port.lng.toFixed(4)}°E</span>
          <span style={{ color: "var(--border-muted)" }}>|</span>
          <span style={{ color: "var(--text-primary)" }}>Sentinel-1 SAR</span>
        </div>
      </div>

      <style>{`
        @keyframes markerPulse {
          0%  { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
          100%{ box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes markerRing {
          0%  { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          100%{ transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
