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

export type ReviewStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "ESCALATED" | "CLEANING";

export type HumanDecision =
  | "pending"
  | "confirmed_spill"
  | "false_positive"
  | "response_approved"
  | "monitoring"
  | "escalated";

export type SpillSource =
  | "Pipeline leak"
  | "Tanker discharge"
  | "Offshore platform"
  | "Port terminal"
  | "Illegal dumping"
  | "Unknown / natural seep";

export type DetectionSource = "Sentinel-1 SAR" | "Optical satellite" | "Manual report";

export type Incident = {
  id: string;
  displayId: string;
  /** Human-readable title, e.g. "Sangachal Coast Oil Spill" */
  title: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  areaM2: number;
  /** 0–1 spill probability from mock AI */
  aiProbability: number;
  risk: RiskLevel;
  status: IncidentStatus;
  portId: string;
  spillSource: SpillSource;
  /** Imagery / sensor source (mock) */
  detectionSource: DetectionSource;
  /** Operator-facing estimated cause */
  estimatedCause: string;
  aiSummary: string;
  humanDecision: HumanDecision;
  humanDecisionNote?: string;
  humanDecisionBy?: string;
  humanDecisionAt?: string;
  reviewStatus: ReviewStatus;
  responseStatus: string;
  relatedVesselId?: string;
  affectedVesselIds: string[];
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

export type AIAnalysis = {
  id: string;
  incidentId: string;
  displayId: string;
  location: string;
  spillProbability: number;
  estimatedAreaM2: number;
  confidence: number;
  risk: RiskLevel;
  possibleSource: SpillSource;
  estimatedCause: string;
  analyzedAt: string;
  summary: string;
  reviewStatus: ReviewStatus;
  status: IncidentStatus;
};

export type ResponseOperation = {
  id: string;
  incidentId: string;
  displayId: string;
  location: string;
  risk: RiskLevel;
  areaM2: number;
  assignedTeam: string;
  status: IncidentStatus;
  reviewStatus: ReviewStatus;
  startTime: string;
  estimatedCompletion: string;
  responseStatus: string;
};

export type ReportSummary = {
  totalIncidents: number;
  totalDetectedAreaM2: number;
  totalCleanedAreaM2: number;
  averageAiConfidence: number;
  highRiskCount: number;
  resolvedCount: number;
  underReviewCount: number;
  avgResponseTimeMin: number;
};

export type OpsVessel = {
  id: string;
  name: string;
  mmsi: string;
  imo?: string;
  type: string;
  lat: number;
  lng: number;
  speedKnots: number;
  heading: number;
  status: "In port" | "Approaching" | "Transiting" | "Suspicious" | "Response";
  portId: string;
  relatedIncidentId?: string;
  lastUpdate: string;
};
