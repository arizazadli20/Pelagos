"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mockData,
  getDashboardKpis,
  getIncidentStats,
  getReportSummary,
  buildAiAnalyses,
  buildResponseOps,
  getEnrichedVessels,
} from "@/lib/mock-data";
import type {
  HumanDecision,
  Incident,
  IncidentStatus,
  ReviewStatus,
} from "@/lib/types";

type ApplyActionInput = {
  incidentId: string;
  action: "confirm" | "reject" | "escalate" | "mark_cleaning";
  note?: string;
  operatorName?: string;
};

type IncidentStoreValue = {
  incidents: Incident[];
  vessels: ReturnType<typeof getEnrichedVessels>;
  riskZones: typeof mockData.riskZones;
  activity: typeof mockData.activityLog;
  kpis: ReturnType<typeof getDashboardKpis>;
  stats: ReturnType<typeof getIncidentStats>;
  report: ReturnType<typeof getReportSummary>;
  aiAnalyses: ReturnType<typeof buildAiAnalyses>;
  responseOps: ReturnType<typeof buildResponseOps>;
  getIncidentById: (id: string) => Incident | undefined;
  applyHumanAction: (input: ApplyActionInput) => void;
};

const IncidentStoreContext = createContext<IncidentStoreValue | null>(null);

function applyActionToIncident(
  incident: Incident,
  action: ApplyActionInput["action"],
  operatorName: string,
  note?: string
): Incident {
  const now = new Date().toISOString();
  const base = {
    humanDecisionBy: operatorName,
    humanDecisionAt: now,
    humanDecisionNote: note,
  };

  switch (action) {
    case "confirm":
      return {
        ...incident,
        ...base,
        status: "under_review" as IncidentStatus,
        reviewStatus: "CONFIRMED" as ReviewStatus,
        humanDecision: "confirmed_spill" as HumanDecision,
        responseStatus: "Confirmed — awaiting response assignment",
        humanDecisionNote:
          note || "Incident confirmed as oil spill by human specialist.",
      };
    case "reject":
      return {
        ...incident,
        ...base,
        status: "rejected",
        reviewStatus: "REJECTED",
        humanDecision: "false_positive",
        responseStatus: "No response — rejected by specialist",
        humanDecisionNote:
          note || "Marked as false positive / non-actionable lookalike.",
      };
    case "escalate":
      return {
        ...incident,
        ...base,
        status: "under_review",
        reviewStatus: "ESCALATED",
        humanDecision: "escalated",
        risk: incident.risk === "LOW" ? "MEDIUM" : "HIGH",
        responseStatus: "Escalated to senior duty officer",
        humanDecisionNote: note || "Escalated for senior operational review.",
      };
    case "mark_cleaning":
      return {
        ...incident,
        ...base,
        status: "cleaning",
        reviewStatus: "CLEANING",
        humanDecision: "response_approved",
        responseStatus: "Cleaning in progress — field team assigned",
        humanDecisionNote:
          note || "Response approved. Cleaning marked as started.",
      };
    default:
      return incident;
  }
}

export function IncidentStoreProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    mockData.incidents.map((i) => ({ ...i }))
  );

  const applyHumanAction = useCallback((input: ApplyActionInput) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === input.incidentId
          ? applyActionToIncident(
              inc,
              input.action,
              input.operatorName || "Operator",
              input.note
            )
          : inc
      )
    );
  }, []);

  const getIncidentById = useCallback(
    (id: string) => incidents.find((i) => i.id === id || i.displayId === id),
    [incidents]
  );

  const value = useMemo<IncidentStoreValue>(() => {
    const vessels = getEnrichedVessels(incidents);
    return {
      incidents,
      vessels,
      riskZones: mockData.riskZones,
      activity: mockData.activityLog,
      kpis: getDashboardKpis(incidents),
      stats: getIncidentStats(incidents),
      report: getReportSummary(incidents),
      aiAnalyses: buildAiAnalyses(incidents),
      responseOps: buildResponseOps(incidents),
      getIncidentById,
      applyHumanAction,
    };
  }, [incidents, getIncidentById, applyHumanAction]);

  return (
    <IncidentStoreContext.Provider value={value}>
      {children}
    </IncidentStoreContext.Provider>
  );
}

export function useIncidentStore() {
  const ctx = useContext(IncidentStoreContext);
  if (!ctx) {
    throw new Error("useIncidentStore must be used within IncidentStoreProvider");
  }
  return ctx;
}
