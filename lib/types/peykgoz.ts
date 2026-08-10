// PEYKGÖZ Platforması üçün Əsas Domen Tipləri

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'UNDER_REVIEW' 
  | 'CONFIRMED' 
  | 'REJECTED'
  | 'ESCALATED' 
  | 'RESPONSE_ASSIGNED' 
  | 'CLEANING_IN_PROGRESS' 
  | 'RESOLVED';

export type HumanDecision = 'ACCEPT' | 'REJECT' | 'REQUEST_VERIFICATION' | 'ESCALATE';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VesselContext {
  id: string;
  name: string;
  mmsi: string;
  distanceKm: number;
  speedKnots: number;
  headingDegrees: number;
  lastReported: string;
  relevanceLabel: 'Potentially Relevant Vessel' | 'In Proximity';
}

export interface WeatherContext {
  windSpeedKmH: number;
  windDirectionDeg: number;
  seaStateScale: number;
  temperatureC: number;
  timestamp: string;
  source: string;
  isLookAlikeRiskHigh: boolean; // Məsələn: zəif külək SAR-da neft ləkəsinə bənzər yalançı görüntü verə bilər
}

export interface AISegmentationResult {
  modelName: string;
  modelVersion: string;
  modelConfidence: number; // 0.0 - 1.0 ("Model Confidence", zəmanətli neft demək deyil)
  pixelProbabilityAvg: number;
  thresholdApplied: number;
  originalSarImageUrl: string;
  segmentedMaskUrl: string;
  polygonGeoJson: any;
  detectedAreaSqm: number;
  processingTimestamp: string;
  qualityFlags: string[];
}

export interface HumanReview {
  reviewerName: string;
  decision: HumanDecision;
  decisionTimestamp: string;
  confidenceScore: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  overrodeAI: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  category: 'SYSTEM' | 'AI' | 'ANALYST' | 'FIELD' | 'LAB';
}

export interface SorbentRecord {
  materialName: string; // Məs: "Pambıq Linteri və Qoz Qabığı Biomahsulu"
  amountUsedKg: number;
  estimatedOilUptakeLiters: number;
  collectionTimestamp: string;
  pyrolysisFeasibilityId?: string;
}

export interface SuspectedSpillIncident {
  id: string;
  code: string; // Məs: "#PG-2026-025"
  title: string;
  locationName: string;
  coordinates: Coordinates;
  detectedAt: string;
  affectedAreaSqm: number;
  riskLevel: RiskLevel;
  status: IncidentStatus;
  
  // Analitik və Kontekst Məlumatları
  aiAnalysis: AISegmentationResult;
  weather: WeatherContext;
  nearbyVessels: VesselContext[];
  
  // Əməliyyat Prosesi
  humanReview?: HumanReview;
  assignedTeam?: string;
  timeline: TimelineEvent[];
  sorbentRecord?: SorbentRecord;
}

export interface DashboardKPIs {
  activeIncidentsCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  resolvedCount: number;
  totalAffectedAreaSqm: number;
  avgResponseTimeMinutes: number;
  avgAIConfidencePercentage: number;
}