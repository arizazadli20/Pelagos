// ============================================================
// PEYKGÖZ domain models
// ============================================================
// Shared TypeScript interfaces for the multi-page app.
// Later: backend / satellite / AI / AIS / weather APIs should
// return data matching these shapes.
// ============================================================

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

/** Incident workflow statuses for Ops pages. */
export type IncidentStatus =
  | "detected"
  | "under_review"
  | "cleaning"
  | "resolved"
  | "rejected";

export type HumanDecision =
  | "pending"
  | "confirmed_spill"
  | "false_positive"
  | "response_approved"
  | "monitoring";

export type SpillSource =
  | "Pipeline leak"
  | "Tanker discharge"
  | "Offshore platform"
  | "Port terminal"
  | "Illegal dumping"
  | "Unknown / natural seep";

export type Incident = {
  id: string;
  displayId: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  areaM2: number;
  aiProbability: number;
  risk: RiskLevel;
  status: IncidentStatus;
  portId: string;
  spillSource: SpillSource;
  aiSummary: string;
  humanDecision: HumanDecision;
  humanDecisionNote?: string;
  humanDecisionBy?: string;
  humanDecisionAt?: string;
  responseStatus: string;
  relatedVesselId?: string;
  weatherSnapshot?: IncidentWeather;
};

export type IncidentWeather = {
  windSpeedKnots: number;
  windHeading: number;
  currentSpeedKnots: number;
  visibilityKm: number;
  seaState: string;
  temperatureC: number;
};

export type IncidentStats = {
  total: number;
  active: number;
  highRisk: number;
  underReview: number;
  resolved: number;
};

/** Placeholder models for upcoming pages (not fully wired yet). */
export type AIAnalysis = {
  id: string;
  incidentId: string;
  confidence: number;
  estimatedAreaM2: number;
  risk: RiskLevel;
  possibleSource: SpillSource;
  analyzedAt: string;
  summary: string;
};

export type ResponseOperation = {
  id: string;
  incidentId: string;
  location: string;
  risk: RiskLevel;
  areaM2: number;
  assignedTeam: string;
  status: string;
  startTime: string;
  estimatedCompletion: string;
};

export type ReportSummary = {
  totalIncidents: number;
  totalDetectedAreaM2: number;
  totalCleanedAreaM2: number;
  averageAiConfidence: number;
  highRiskCount: number;
  avgResponseTimeMin: number;
};
