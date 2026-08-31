"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import {
  formatAreaM2,
  formatDateTimeAZT,
  HUMAN_DECISION_LABEL,
  getVesselById,
} from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import { getWindContext, getSeaState, type WindContext, type SeaState } from "@/lib/weather";
import RiskBadge from "@/components/ui/RiskBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import DetailPanel from "@/components/ui/DetailPanel";
import { useIncidentStore } from "@/lib/incident-store";
import { getCurrentUser } from "@/lib/auth";
import {
  Satellite,
  Ship,
  CloudSun,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Droplets,
  Brain,
  FileDown,
  Loader2,
  History,
  ListChecks,
  DollarSign,
  Anchor,
} from "lucide-react";

const RESPONSE_TEAMS = ["Alpha Response", "Bravo Team", "Charlie Team", "Delta Team"];
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic mock cleanup materials derived from the incident, so the
 * same incident always shows the same "used" quantities. */
function deriveResponseMaterials(incident: Incident) {
  const seed = hashString(incident.id);
  const boomMeters = Math.round(incident.areaM2 * 0.35 + (seed % 40));
  const sorbentKg = Math.round(incident.areaM2 * 0.6 + (seed % 60));
  const skimmerUnits = 1 + (seed % 3);
  const vesselCount = 1 + (seed % 2);
  const estimatedCostUsd = Math.round(
    boomMeters * 12 + sorbentKg * 4 + skimmerUnits * 1500 + vesselCount * 2200
  );
  return {
    boomMeters,
    sorbentKg,
    skimmerUnits,
    vesselCount,
    team: RESPONSE_TEAMS[seed % RESPONSE_TEAMS.length],
    durationHours: 3 + (seed % 6),
    estimatedCostUsd,
  };
}

/** Deterministic mock AI-derived impact estimates for the deep-dive view. */
function deriveAiImpact(incident: Incident, windHeading?: number) {
  const seed = hashString(incident.id + "-impact");
  const heading = windHeading ?? seed % 360;
  return {
    volumeBbl: Math.max(1, Math.round(incident.areaM2 * 0.012 + (seed % 8))),
    driftHeading: Math.round(heading),
    driftCompass: COMPASS[Math.round(heading / 22.5) % 16],
    driftKm24h: Math.round(2 + (seed % 9)),
    modelVersion: `sar-slick-v${1 + (seed % 3)}.${seed % 10}`,
  };
}

/** Deterministic mock confidence sub-scores + processing pipeline, shown only
 * in the dedicated AI Analysis deep-dive view. */
function deriveAiDeepDive(incident: Incident) {
  const seed = hashString(incident.id + "-deep");
  const texture = 72 + (seed % 24);
  const edge = 68 + ((seed >> 3) % 28);
  const spectral = 75 + ((seed >> 6) % 20);
  return {
    confidence: { texture, edge, spectral },
    pipeline: [
      { step: "SAR preprocessing & calibration", ms: 800 + (seed % 400) },
      { step: "Speckle filtering", ms: 400 + (seed % 200) },
      { step: "Dark-spot anomaly detection", ms: 1200 + (seed % 600) },
      { step: "Shape & texture classification", ms: 900 + (seed % 500) },
      { step: "Environmental cross-reference", ms: 500 + (seed % 300) },
      { step: "Confidence scoring & packaging", ms: 300 + (seed % 150) },
    ],
  };
}

/** Pick up to 2 other incidents with a similar risk profile, for the "similar
 * historical incidents" comparison in the AI deep-dive. */
function findSimilarIncidents(incident: Incident, all: Incident[]) {
  const seed = hashString(incident.id + "-similar");
  return all
    .filter((i) => i.id !== incident.id && i.risk === incident.risk)
    .slice(0, 2)
    .map((i, idx) => ({
      displayId: i.displayId,
      location: i.location,
      similarity: 82 + ((seed >> (idx * 4)) % 15),
    }));
}

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--surface-muted)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, borderRadius: 3, background: "var(--accent)" }} />
      </div>
    </div>
  );
}

function generateIncidentPdf(
  incident: Incident,
  materials: ReturnType<typeof deriveResponseMaterials>
) {
  const doc = new jsPDF();
  let y = 20;
  const line = (text: string, size = 11, bold = false, gap = 7) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, 14, y);
    y += gap;
  };

  line("SeaSeatry — Incident Response Report", 18, true, 10);
  doc.setDrawColor(200);
  doc.line(14, y - 4, 196, y - 4);
  y += 2;

  line(`Incident ${incident.displayId} — ${incident.title}`, 13, true, 8);
  line(`Location: ${incident.location}`);
  line(`Coordinates: ${incident.lat.toFixed(4)}°N, ${incident.lng.toFixed(4)}°E`);
  line(`Detected: ${formatDateTimeAZT(incident.timestamp)} AZT`);
  line(`Risk: ${incident.risk}    Status: ${incident.status}`);
  line(`Estimated area: ${formatAreaM2(incident.areaM2)}`);
  y += 4;

  line("Human decision", 13, true, 8);
  line(`Decision: ${HUMAN_DECISION_LABEL[incident.humanDecision] ?? incident.humanDecision}`);
  if (incident.humanDecisionBy) line(`Specialist: ${incident.humanDecisionBy}`);
  if (incident.humanDecisionAt) line(`Decided at: ${formatDateTimeAZT(incident.humanDecisionAt)} AZT`);
  if (incident.humanDecisionNote) line(`Notes: ${incident.humanDecisionNote}`);
  y += 4;

  line("Response & cleanup", 13, true, 8);
  line(`Team assigned: ${materials.team}`);
  line(`Boom deployed: ${materials.boomMeters} m`);
  line(`Sorbent used: ${materials.sorbentKg} kg`);
  line(`Skimmer units: ${materials.skimmerUnits}`);
  line(`Support vessels: ${materials.vesselCount}`);
  line(`Estimated duration: ${materials.durationHours} h`);
  line(`Estimated cost: $${materials.estimatedCostUsd.toLocaleString("en-US")}`);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Demo document generated by SeaSeatry — a mock oil-spill intelligence platform. Figures are simulated.",
    14,
    285
  );

  doc.save(`seaseatry-incident-${incident.displayId.replace("#", "")}-report.pdf`);
}

type Props = {
  incident: Incident | null;
  onClose: () => void;
  wide?: boolean;
  /** "incident" (default) shows a compact AI summary with a link to the full
   * breakdown. "ai" shows the full AI deep-dive — used when opened via the
   * "AI overlay" click-through from the incident view. */
  context?: "incident" | "ai";
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.45 }}>
        {children}
      </div>
    </div>
  );
}

function FreshnessNote({ staleMinutes }: { staleMinutes: number }) {
  return (
    <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
      Open-Meteo · {staleMinutes}m stale
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: 18,
        paddingBottom: 18,
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          color: "var(--text-secondary)",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function ImagePlaceholder({
  title,
  subtitle,
  accent,
  onClick,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        height: 120,
        borderRadius: 8,
        border: clickable
          ? "1px solid rgba(224,122,95,0.35)"
          : "1px dashed var(--glass-border-light)",
        background: `linear-gradient(160deg, ${accent} 0%, var(--bg-elevated) 60%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        textAlign: "center",
        padding: 12,
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <Satellite size={18} color="var(--accent)" />
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{subtitle}</div>
      {clickable && (
        <div style={{ fontSize: 9, color: "var(--color-high-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          View AI analysis →
        </div>
      )}
    </div>
  );
}

const actionBtnStyle = (variant: "primary" | "danger" | "neutral" | "warn"): React.CSSProperties => {
  const map = {
    primary: {
      color: "var(--accent)",
      border: "1px solid rgba(129,178,154,0.35)",
      background: "var(--accent-soft)",
    },
    danger: {
      color: "var(--color-high-text)",
      border: "1px solid rgba(224,122,95,0.3)",
      background: "rgba(224,122,95,0.1)",
    },
    warn: {
      color: "var(--color-med-text)",
      border: "1px solid rgba(233,196,106,0.3)",
      background: "rgba(233,196,106,0.1)",
    },
    neutral: {
      color: "var(--accent)",
      border: "1px solid rgba(129,178,154,0.3)",
      background: "rgba(129,178,154,0.08)",
    },
  }[variant];

  return {
    ...map,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 7,
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
  };
};

export default function IncidentDetailsPanel({ incident, onClose, wide, context = "incident" }: Props) {
  const router = useRouter();
  const { incidents: allIncidents, applyHumanAction, getIncidentById } = useIncidentStore();
  const live = incident ? getIncidentById(incident.id) || incident : null;
  const vessel = getVesselById(live?.relatedVesselId);
  const pending = live?.reviewStatus === "PENDING" || live?.humanDecision === "pending";

  const [wind, setWind] = useState<WindContext | null>(null);
  const [sea, setSea] = useState<SeaState | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "ready">("idle");

  const generatePdf = (materials: ReturnType<typeof deriveResponseMaterials>) => {
    if (pdfState !== "idle" || !live) return;
    setPdfState("generating");
    setTimeout(() => {
      generateIncidentPdf(live, materials);
      setPdfState("ready");
    }, 1200);
  };

  useEffect(() => {
    setPdfState("idle");
  }, [live?.id]);

  useEffect(() => {
    if (!live) {
      setWind(null);
      setSea(null);
      return;
    }
    let cancelled = false;
    setWeatherLoading(true);
    setWind(null);
    setSea(null);
    Promise.all([
      getWindContext(live.lat, live.lng, live.timestamp),
      getSeaState(live.lat, live.lng, live.timestamp),
    ]).then(([w, s]) => {
      if (cancelled) return;
      setWind(w);
      setSea(s);
      setWeatherLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [live?.id, live?.lat, live?.lng, live?.timestamp]);

  const run = (action: "confirm" | "reject" | "escalate" | "mark_cleaning") => {
    if (!live) return;
    const user = getCurrentUser();
    applyHumanAction({
      incidentId: live.id,
      action,
      operatorName: user?.name || "Operator",
    });
  };

  return (
    <DetailPanel
      open={!!live}
      title={live ? `Incident ${live.displayId}` : ""}
      subtitle={live?.title || live?.location}
      onClose={onClose}
      width={wide ? "min(900px, 94vw)" : 480}
      variant={wide ? "center" : "side"}
    >
      {live && (
        <>
          <Section title="Incident information">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Incident ID">
                <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--accent)" }}>
                  {live.displayId}
                </span>
              </Field>
              <Field label="Detection source">{live.detectionSource}</Field>
              <Field label="Location">{live.location}</Field>
              <Field label="Detection time">
                {formatDateTimeAZT(live.timestamp)} AZT
              </Field>
              <Field label="Coordinates">
                <span style={{ fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, monospace" }}>
                  {live.lat.toFixed(4)}°N, {live.lng.toFixed(4)}°E
                </span>
              </Field>
              <Field label="Estimated area">{formatAreaM2(live.areaM2)}</Field>
              <Field label="Risk">
                <RiskBadge risk={live.risk} />
              </Field>
              <Field label="Status">
                <StatusBadge status={live.status} />
              </Field>
              <Field label="Model confidence">
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {Math.round(live.aiProbability * 100)}%
                </span>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 4 }}>
                  (not a pollution probability)
                </span>
              </Field>
              <Field label="Review status">{live.reviewStatus}</Field>
            </div>
          </Section>

          <Section title="Satellite analysis" icon={<Satellite size={14} />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ImagePlaceholder
                title="Original SAR (mock)"
                subtitle="Placeholder — Sentinel-1 feed not connected"
                accent="rgba(129,178,154,0.08)"
              />
              <ImagePlaceholder
                title="AI overlay (mock)"
                subtitle="Detected boundary placeholder"
                accent="rgba(224,122,95,0.1)"
                onClick={() => router.push(`/ai-analysis?open=${live.id}&wide=1`)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <Field label="Detected area">{formatAreaM2(live.areaM2)}</Field>
              <Field label="Model confidence">
                {Math.round(live.aiProbability * 100)}%
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 4 }}>
                  (not a pollution probability)
                </span>
              </Field>
            </div>
          </Section>

          <Section title="AI analysis" icon={<Brain size={14} />}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55 }}>
              {live.aiSummary}
            </p>

            {context === "incident" ? (
              <button
                type="button"
                onClick={() => router.push(`/ai-analysis?open=${live.id}&wide=1`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  width: "100%",
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(224,122,95,0.3)",
                  background: "rgba(224,122,95,0.08)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Full breakdown available — confidence scoring, drift forecast, processing pipeline.
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-high-text)", whiteSpace: "nowrap" }}>
                  Open AI Analysis →
                </span>
              </button>
            ) : (
              <>
                {(() => {
                  const impact = deriveAiImpact(live, wind?.windHeading);
                  const deep = deriveAiDeepDive(live);
                  const similar = findSimilarIncidents(live, allIncidents);
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                        <Field label="Estimated volume">~{impact.volumeBbl} bbl</Field>
                        <Field label="Model version">{impact.modelVersion}</Field>
                        <Field label="24h drift forecast">
                          {impact.driftKm24h} km toward {impact.driftCompass} ({impact.driftHeading}°)
                          {wind && (
                            <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 4 }}>
                              — from live wind
                            </span>
                          )}
                        </Field>
                      </div>

                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                          Detection confidence breakdown
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          <ConfidenceBar label="Texture consistency" value={deep.confidence.texture} />
                          <ConfidenceBar label="Edge sharpness" value={deep.confidence.edge} />
                          <ConfidenceBar label="Spectral signature" value={deep.confidence.spectral} />
                        </div>
                      </div>

                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                          Processing pipeline
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                          {deep.pipeline.map((step) => (
                            <div key={step.step} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-primary)" }}>
                                <CheckCircle2 size={12} color="var(--accent)" />
                                {step.step}
                              </span>
                              <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}>
                                {(step.ms / 1000).toFixed(1)}s
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {similar.length > 0 && (
                        <div style={{ marginTop: 18 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                            <History size={12} /> Similar historical incidents
                          </div>
                          <div style={{ display: "grid", gap: 6 }}>
                            {similar.map((s) => (
                              <div key={s.displayId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                                <span>{s.displayId} · {s.location}</span>
                                <span style={{ fontWeight: 600, color: "var(--accent)" }}>{s.similarity}% similar</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}

            <div style={{ marginTop: 14 }}>
              <Field label="Estimated cause">
                <div style={{ marginTop: 8 }}>{live.estimatedCause}</div>
              </Field>
            </div>
            <Field label="Unconfirmed source hypothesis">
              <div style={{ marginTop: 8 }}>
                {live.spillSource}
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 6 }}>
                  — unconfirmed, pending human review
                </span>
              </div>
            </Field>
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(233,196,106,0.08)",
                border: "1px solid rgba(233,196,106,0.28)",
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "var(--color-med-text)" }}>Human review required.</strong>
              <br />
              AI provides analysis and recommendations. Final operational decisions are made by
              human experts.
            </div>
          </Section>

          {vessel && (
            <Section title="Related vessel" icon={<Ship size={14} />}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Name">{vessel.name}</Field>
                <Field label="Type">{vessel.type}</Field>
                <Field label="Status">{vessel.status}</Field>
                <Field label="Speed">{vessel.speedKnots.toFixed(1)} kn</Field>
              </div>
            </Section>
          )}

          <Section title="Environmental context" icon={<CloudSun size={14} />}>
            {weatherLoading && !wind && !sea ? (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                Loading live weather…
              </div>
            ) : wind || sea ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {wind && (
                  <Field label="Wind">
                    {wind.windSpeedKnots} kn · {wind.windHeading}°
                    <FreshnessNote staleMinutes={wind.staleMinutes} />
                  </Field>
                )}
                {sea && (
                  <Field label="Sea state">
                    {sea.seaState}
                    <FreshnessNote staleMinutes={sea.staleMinutes} />
                  </Field>
                )}
                {wind && (
                  <Field label="Visibility">
                    {wind.visibilityKm} km
                    <FreshnessNote staleMinutes={wind.staleMinutes} />
                  </Field>
                )}
                {sea && (
                  <Field label="Wave height">
                    {sea.waveHeightM} m · {sea.wavePeriodS}s period
                    <FreshnessNote staleMinutes={sea.staleMinutes} />
                  </Field>
                )}
                {wind && (
                  <Field label="Temperature">
                    {wind.temperatureC}°C
                    <FreshnessNote staleMinutes={wind.staleMinutes} />
                  </Field>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                Live weather unavailable
              </div>
            )}
          </Section>

          <Section title="Response status">
            <Field label="Current status">{live.responseStatus}</Field>
          </Section>

          {/* Human-in-the-loop decision — deliberately styled to stand out,
              this is the core product feature: AI never decides alone. */}
          <div
            style={{
              marginBottom: 18,
              borderRadius: 12,
              border: "1.5px solid var(--accent)",
              background: "var(--accent-soft)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bg-elevated)",
                  flexShrink: 0,
                }}
              >
                <UserCheck size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", color: "var(--text-primary)" }}>
                  Human-in-the-Loop Decision
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  The final operational call — always made by a person, never the AI.
                </div>
              </div>
              {pending && (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: "var(--color-high-text)",
                    borderRadius: 12,
                    padding: "4px 9px",
                  }}
                >
                  Awaiting
                </span>
              )}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Decision">
                {HUMAN_DECISION_LABEL[live.humanDecision] ?? live.humanDecision}
              </Field>
              {live.humanDecisionBy && <Field label="Specialist">{live.humanDecisionBy}</Field>}
              {live.humanDecisionAt && (
                <Field label="Decided at">{formatDateTimeAZT(live.humanDecisionAt)} AZT</Field>
              )}
              {live.humanDecisionNote && <Field label="Notes">{live.humanDecisionNote}</Field>}
            </div>

            {pending && (
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button type="button" style={actionBtnStyle("primary")} onClick={() => run("confirm")}>
                  <CheckCircle2 size={13} /> Confirm Incident
                </button>
                <button type="button" style={actionBtnStyle("danger")} onClick={() => run("reject")}>
                  <XCircle size={13} /> Reject Incident
                </button>
                <button type="button" style={actionBtnStyle("warn")} onClick={() => run("escalate")}>
                  <AlertTriangle size={13} /> Escalate
                </button>
                <button type="button" style={actionBtnStyle("neutral")} onClick={() => run("mark_cleaning")}>
                  <Droplets size={13} /> Mark for Cleaning
                </button>
              </div>
            )}

            {!pending && live.status !== "resolved" && live.status !== "rejected" && live.status !== "cleaning" && (
              <div style={{ marginTop: 12 }}>
                <button type="button" style={actionBtnStyle("neutral")} onClick={() => run("mark_cleaning")}>
                  <Droplets size={13} /> Mark Cleaning Started
                </button>
              </div>
            )}
          </div>

          {!pending && live.status !== "rejected" && (
            <Section title="Response report" icon={<ListChecks size={14} />}>
              {(() => {
                const materials = deriveResponseMaterials(live);
                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                      <Field label="Incident">
                        {live.displayId} · {live.location}
                      </Field>
                      <Field label="Affected area">{formatAreaM2(live.areaM2)}</Field>
                      <Field label="Report prepared by">{live.humanDecisionBy || "Auto-generated"}</Field>
                      <Field label="Report date">{formatDateTimeAZT(new Date().toISOString())} AZT</Field>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                        Equipment & crew
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Boom deployed">{materials.boomMeters} m</Field>
                        <Field label="Sorbent used">{materials.sorbentKg} kg</Field>
                        <Field label="Skimmer units">{materials.skimmerUnits}</Field>
                        <Field label="Support vessels">
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Anchor size={12} /> {materials.vesselCount}
                          </span>
                        </Field>
                        <Field label="Team assigned">{materials.team}</Field>
                        <Field label="Estimated duration">{materials.durationHours} h</Field>
                      </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                        Response phases
                      </div>
                      <div style={{ display: "grid", gap: 6 }}>
                        {[
                          { phase: "Mobilization", done: true },
                          { phase: "Containment", done: true },
                          { phase: "Recovery", done: live.status === "resolved" || live.status === "cleaning" },
                          { phase: "Site restoration & sign-off", done: live.status === "resolved" },
                        ].map((p) => (
                          <div key={p.phase} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            {p.done ? (
                              <CheckCircle2 size={12} color="var(--accent)" />
                            ) : (
                              <Loader2 size={12} color="var(--text-tertiary)" />
                            )}
                            <span style={{ color: p.done ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                              {p.phase}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "var(--surface-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                        <DollarSign size={13} /> Estimated response cost
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                        ${materials.estimatedCostUsd.toLocaleString("en-US")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => generatePdf(materials)}
                      disabled={pdfState !== "idle"}
                      style={{
                        ...actionBtnStyle(pdfState === "ready" ? "primary" : "neutral"),
                        marginTop: 16,
                        cursor: pdfState === "idle" ? "pointer" : "default",
                      }}
                    >
                      {pdfState === "generating" && <Loader2 size={13} className="spinner" />}
                      {pdfState === "ready" && <CheckCircle2 size={13} />}
                      {pdfState === "idle" && <FileDown size={13} />}
                      {pdfState === "idle" && "Generate PDF Report"}
                      {pdfState === "generating" && "Generating…"}
                      {pdfState === "ready" && "Downloaded — Generate Again"}
                    </button>
                    {pdfState === "ready" && (
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6, textAlign: "center" }}>
                        A real PDF was saved to your downloads.
                      </div>
                    )}
                  </>
                );
              })()}
            </Section>
          )}
        </>
      )}
    </DetailPanel>
  );
}
