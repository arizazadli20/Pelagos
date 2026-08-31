"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const RESPONSE_TEAMS = ["Alpha Response", "Bravo Team", "Charlie Team", "Delta Team"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic mock cleanup materials derived from the incident, so the
 * same incident always shows the same "used" quantities. */
function deriveResponseMaterials(incident: Incident) {
  const seed = hashString(incident.id);
  return {
    boomMeters: Math.round(incident.areaM2 * 0.35 + (seed % 40)),
    sorbentKg: Math.round(incident.areaM2 * 0.6 + (seed % 60)),
    team: RESPONSE_TEAMS[seed % RESPONSE_TEAMS.length],
    durationHours: 3 + (seed % 6),
  };
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

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

type Props = {
  incident: Incident | null;
  onClose: () => void;
  wide?: boolean;
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

export default function IncidentDetailsPanel({ incident, onClose, wide }: Props) {
  const router = useRouter();
  const { applyHumanAction, getIncidentById } = useIncidentStore();
  const live = incident ? getIncidentById(incident.id) || incident : null;
  const vessel = getVesselById(live?.relatedVesselId);
  const pending = live?.reviewStatus === "PENDING" || live?.humanDecision === "pending";

  const [wind, setWind] = useState<WindContext | null>(null);
  const [sea, setSea] = useState<SeaState | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "ready">("idle");

  const generatePdf = () => {
    if (pdfState !== "idle") return;
    setPdfState("generating");
    setTimeout(() => setPdfState("ready"), 1400);
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

            {(() => {
              const impact = deriveAiImpact(live, wind?.windHeading);
              return (
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
              );
            })()}

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

          <Section title="Human decision" icon={<UserCheck size={14} />}>
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
          </Section>

          {!pending && live.status !== "rejected" && (
            <Section title="Response report">
              {(() => {
                const materials = deriveResponseMaterials(live);
                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <Field label="Incident">
                        {live.displayId} · {live.location}
                      </Field>
                      <Field label="Affected area">{formatAreaM2(live.areaM2)}</Field>
                      <Field label="Boom deployed">{materials.boomMeters} m</Field>
                      <Field label="Sorbent used">{materials.sorbentKg} kg</Field>
                      <Field label="Team assigned">{materials.team}</Field>
                      <Field label="Estimated duration">{materials.durationHours} h</Field>
                    </div>

                    <button
                      type="button"
                      onClick={generatePdf}
                      disabled={pdfState !== "idle"}
                      style={{
                        ...actionBtnStyle(pdfState === "ready" ? "primary" : "neutral"),
                        cursor: pdfState === "idle" ? "pointer" : "default",
                      }}
                    >
                      {pdfState === "generating" && <Loader2 size={13} className="spinner" />}
                      {pdfState === "ready" && <CheckCircle2 size={13} />}
                      {pdfState === "idle" && <FileDown size={13} />}
                      {pdfState === "idle" && "Generate PDF Report"}
                      {pdfState === "generating" && "Generating…"}
                      {pdfState === "ready" && "Report Ready"}
                    </button>
                    {pdfState === "ready" && (
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 6, textAlign: "center" }}>
                        Demo simulation — no file is actually created.
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
