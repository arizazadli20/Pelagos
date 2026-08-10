"use client";

import {
  formatAreaM2,
  formatDateTimeAZT,
  HUMAN_DECISION_LABEL,
  getVesselById,
} from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import RiskBadge from "@/components/ui/RiskBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import DetailPanel from "@/components/ui/DetailPanel";
import { Satellite, Ship, CloudSun, UserCheck } from "lucide-react";

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

export default function IncidentDetailsPanel({ incident, onClose }: Props) {
  const vessel = getVesselById(incident?.relatedVesselId);

  return (
    <DetailPanel
      open={!!incident}
      title={incident ? `Incident ${incident.displayId}` : ""}
      subtitle={incident?.location}
      onClose={onClose}
      width={460}
    >
      {incident && (
        <>
          <Section title="Detection overview">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="Location">{incident.location}</Field>
              <Field label="Detection time">
                {formatDateTimeAZT(incident.timestamp)} AZT
              </Field>
              <Field label="Coordinates">
                <span style={{ fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, monospace" }}>
                  {incident.lat.toFixed(4)}°N, {incident.lng.toFixed(4)}°E
                </span>
              </Field>
              <Field label="Estimated area">{formatAreaM2(incident.areaM2)}</Field>
              <Field label="Risk level">
                <RiskBadge risk={incident.risk} />
              </Field>
              <Field label="AI confidence">
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {Math.round(incident.aiProbability * 100)}%
                </span>
              </Field>
              <Field label="Spill source">{incident.spillSource}</Field>
              <Field label="Status">
                <StatusBadge status={incident.status} />
              </Field>
            </div>
          </Section>

          <Section title="Satellite imagery" icon={<Satellite size={14} />}>
            <div
              style={{
                height: 160,
                borderRadius: 8,
                border: "1px dashed var(--glass-border-light)",
                background:
                  "linear-gradient(160deg, rgba(56,189,248,0.06) 0%, rgba(11,20,32,0.9) 55%, rgba(239,68,68,0.08) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "var(--text-secondary)",
                textAlign: "center",
                padding: 16,
              }}
            >
              <Satellite size={22} color="var(--accent)" />
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                Sentinel-1 SAR frame (placeholder)
              </div>
              <div style={{ fontSize: 11, maxWidth: 260, lineHeight: 1.4 }}>
                Live satellite imagery API will be connected in a later phase.
              </div>
            </div>
          </Section>

          <Section title="AI analysis summary">
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--text-primary)",
                lineHeight: 1.55,
              }}
            >
              {incident.aiSummary}
            </p>
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "var(--accent-soft)",
                border: "1px solid rgba(56,189,248,0.22)",
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              AI provides analysis and recommendations. Final decisions remain with
              human specialists.
            </div>
          </Section>

          {vessel && (
            <Section title="Related vessel" icon={<Ship size={14} />}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Name">{vessel.name}</Field>
                <Field label="Type">{vessel.type}</Field>
                <Field label="Status">{vessel.status}</Field>
                <Field label="Speed">{vessel.speedKnots.toFixed(1)} kn</Field>
                <Field label="Heading">{vessel.heading}°</Field>
                <Field label="Position">
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
                    {vessel.lat.toFixed(3)}°N, {vessel.lng.toFixed(3)}°E
                  </span>
                </Field>
              </div>
            </Section>
          )}

          {incident.weatherSnapshot && (
            <Section title="Weather snapshot" icon={<CloudSun size={14} />}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Wind">
                  {incident.weatherSnapshot.windSpeedKnots} kn ·{" "}
                  {incident.weatherSnapshot.windHeading}°
                </Field>
                <Field label="Current">
                  {incident.weatherSnapshot.currentSpeedKnots} kn
                </Field>
                <Field label="Sea state">{incident.weatherSnapshot.seaState}</Field>
                <Field label="Visibility">
                  {incident.weatherSnapshot.visibilityKm} km
                </Field>
                <Field label="Temperature">
                  {incident.weatherSnapshot.temperatureC}°C
                </Field>
              </div>
            </Section>
          )}

          <Section title="Response status">
            <Field label="Current status">{incident.responseStatus}</Field>
          </Section>

          <Section title="Human decision" icon={<UserCheck size={14} />}>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Decision">
                {HUMAN_DECISION_LABEL[incident.humanDecision] ?? incident.humanDecision}
              </Field>
              {incident.humanDecisionBy && (
                <Field label="Specialist">{incident.humanDecisionBy}</Field>
              )}
              {incident.humanDecisionAt && (
                <Field label="Decided at">
                  {formatDateTimeAZT(incident.humanDecisionAt)} AZT
                </Field>
              )}
              {incident.humanDecisionNote && (
                <Field label="Notes">{incident.humanDecisionNote}</Field>
              )}
            </div>
          </Section>
        </>
      )}
    </DetailPanel>
  );
}
