"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

type Props = {
  incident: Incident | null;
  onClose: () => void;
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
}: {
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      style={{
        height: 120,
        borderRadius: 8,
        border: "1px dashed var(--glass-border-light)",
        background: `linear-gradient(160deg, ${accent} 0%, var(--bg-elevated) 60%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        textAlign: "center",
        padding: 12,
      }}
    >
      <Satellite size={18} color="var(--accent)" />
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{subtitle}</div>
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
      color: "#C1503A",
      border: "1px solid rgba(224,122,95,0.3)",
      background: "rgba(224,122,95,0.1)",
    },
    warn: {
      color: "#9C7A1D",
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

export default function IncidentDetailsPanel({ incident, onClose }: Props) {
  const { applyHumanAction, getIncidentById } = useIncidentStore();
  const live = incident ? getIncidentById(incident.id) || incident : null;
  const vessel = getVesselById(live?.relatedVesselId);
  const pending = live?.reviewStatus === "PENDING" || live?.humanDecision === "pending";

  const [wind, setWind] = useState<WindContext | null>(null);
  const [sea, setSea] = useState<SeaState | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

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
      width={480}
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
            <Field label="Estimated cause">
              <div style={{ marginTop: 8 }}>{live.estimatedCause}</div>
            </Field>
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
              <strong style={{ color: "#9C7A1D" }}>Human review required.</strong>
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
        </>
      )}
    </DetailPanel>
  );
}
