"use client";

import { useMemo, useState } from "react";
import {
  mockData,
  getIncidentStats,
  formatAreaM2,
  formatDateTimeAZT,
} from "@/lib/mock-data";
import type { Incident, IncidentStatus, RiskLevel } from "@/lib/types";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import FilterBar from "@/components/ui/FilterBar";
import RiskBadge from "@/components/ui/RiskBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import IncidentDetailsPanel from "@/components/incidents/IncidentDetailsPanel";
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  Eye,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";

type SortKey =
  | "displayId"
  | "location"
  | "timestamp"
  | "areaM2"
  | "risk"
  | "aiProbability"
  | "status";

type DateFilter = "all" | "today" | "7d" | "30d";

const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function matchesDate(ts: string, filter: DateFilter) {
  if (filter === "all") return true;
  const t = new Date(ts).getTime();
  const now = Date.now();
  if (filter === "today") {
    const d = new Date();
    const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return t >= start;
  }
  const days = filter === "7d" ? 7 : 30;
  return t >= now - days * 86400000;
}

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Incident | null>(null);

  const incidents = mockData.incidents;
  const stats = getIncidentStats(incidents);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = incidents.filter((inc) => {
      if (riskFilter !== "all" && inc.risk !== riskFilter) return false;
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (!matchesDate(inc.timestamp, dateFilter)) return false;
      if (!q) return true;
      return (
        inc.displayId.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.spillSource.toLowerCase().includes(q) ||
        inc.status.toLowerCase().includes(q)
      );
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "displayId":
          cmp = a.displayId.localeCompare(b.displayId);
          break;
        case "location":
          cmp = a.location.localeCompare(b.location);
          break;
        case "timestamp":
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case "areaM2":
          cmp = a.areaM2 - b.areaM2;
          break;
        case "risk":
          cmp = RISK_ORDER[a.risk] - RISK_ORDER[b.risk];
          break;
        case "aiProbability":
          cmp = a.aiProbability - b.aiProbability;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [incidents, search, riskFilter, statusFilter, dateFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "timestamp" || key === "areaM2" || key === "aiProbability" ? "desc" : "asc");
    }
  };

  const SortHead = ({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: sortKey === column ? "var(--accent)" : "var(--text-tertiary)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      <ArrowUpDown size={11} opacity={sortKey === column ? 1 : 0.45} />
    </button>
  );

  return (
    <AppShell active="incidents">
      <div className="dashboard-scroll">
        <PageHeader
          title="Incidents"
          subtitle="Manage Caspian Sea oil spill detections — from satellite alert through human review and cleanup."
        />

        <section
          aria-label="Incident statistics"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
          }}
          className="incidents-stat-grid"
        >
          <StatCard
            label="Total Incidents"
            value={stats.total}
            hint="All recorded cases"
            icon={<Activity size={15} />}
          />
          <StatCard
            label="Active"
            value={stats.active}
            hint="Open operational cases"
            accent="var(--color-high)"
            icon={<AlertTriangle size={15} />}
          />
          <StatCard
            label="High Risk"
            value={stats.highRisk}
            hint="Priority attention"
            accent="var(--color-med)"
            icon={<ShieldAlert size={15} />}
          />
          <StatCard
            label="Under Review"
            value={stats.underReview}
            hint="Awaiting specialists"
            accent="var(--accent)"
            icon={<Eye size={15} />}
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            hint="Closed successfully"
            accent="var(--color-low)"
            icon={<CheckCircle2 size={15} />}
          />
        </section>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ID, location, source…"
          filters={[
            {
              id: "risk",
              label: "Risk",
              value: riskFilter,
              onChange: setRiskFilter,
              options: [
                { value: "all", label: "All risks" },
                { value: "HIGH", label: "High" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LOW", label: "Low" },
              ],
            },
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "All statuses" },
                { value: "detected", label: "Detected" },
                { value: "under_review", label: "Under Review" },
                { value: "cleaning", label: "Cleaning" },
                { value: "resolved", label: "Resolved" },
                { value: "rejected", label: "Rejected" },
              ],
            },
            {
              id: "date",
              label: "Date",
              value: dateFilter,
              onChange: (v) => setDateFilter(v as DateFilter),
              options: [
                { value: "all", label: "All dates" },
                { value: "today", label: "Today" },
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
              ],
            },
          ]}
          trailing={
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          }
        />

        <div className="panel" style={{ minHeight: 360 }}>
          <div className="panel-header">
            <span className="panel-title">Incident register</span>
          </div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "70px 1.3fr 1.2fr 1.2fr 90px 80px 80px 110px 90px",
                gap: 8,
                padding: "10px 16px",
                borderBottom: "1px solid var(--glass-border)",
                background: "rgba(0,0,0,0.18)",
                position: "sticky",
                top: 0,
                zIndex: 1,
                minWidth: 980,
              }}
            >
              <SortHead label="ID" column="displayId" />
              <SortHead label="Location" column="location" />
              <SortHead label="Date / Time" column="timestamp" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                }}
              >
                Spill Source
              </span>
              <SortHead label="Area" column="areaM2" />
              <SortHead label="Risk" column="risk" />
              <SortHead label="AI" column="aiProbability" />
              <SortHead label="Status" column="status" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                }}
              >
                Action
              </span>
            </div>

            {filtered.length === 0 && (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                No incidents match the current filters.
              </div>
            )}

            {filtered.map((inc, i) => (
              <div
                key={inc.id}
                className="row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "70px 1.3fr 1.2fr 1.2fr 90px 80px 80px 110px 90px",
                  gap: 8,
                  padding: "12px 16px",
                  alignItems: "center",
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid rgba(42,63,85,0.35)"
                      : "none",
                  borderRadius: 0,
                  minWidth: 980,
                  cursor: "pointer",
                }}
                onClick={() => setSelected(inc)}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "ui-monospace, monospace",
                    color: "var(--accent)",
                  }}
                >
                  {inc.displayId}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{inc.location}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDateTimeAZT(inc.timestamp)}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {inc.spillSource}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatAreaM2(inc.areaM2)}
                </span>
                <RiskBadge risk={inc.risk} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {Math.round(inc.aiProbability * 100)}%
                </span>
                <StatusBadge status={inc.status as IncidentStatus} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(inc);
                  }}
                  style={{
                    background: "var(--accent-soft)",
                    border: "1px solid rgba(56,189,248,0.3)",
                    borderRadius: 6,
                    color: "var(--accent)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "fit-content",
                  }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IncidentDetailsPanel incident={selected} onClose={() => setSelected(null)} />

      <style>{`
        @media (max-width: 1200px) {
          .incidents-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 700px) {
          .incidents-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </AppShell>
  );
}
