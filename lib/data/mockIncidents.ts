import { SuspectedSpillIncident, DashboardKPIs, RiskLevel, IncidentStatus } from '../types/peykgoz';


export const MOCK_INCIDENTS: SuspectedSpillIncident[] = [
  {
    id: 'inc-025',
    code: '#PG-2026-025',
    title: 'Şimal Akvatoriyasında Şübhəli Yağ Təbəqəsi',
    locationName: 'Bakı Beynəlxalq Dəniz Ticarət Limanı (Şimal)',
    coordinates: { lat: 40.3712, lng: 49.8921 },
    detectedAt: '2026-08-10T10:35:00Z',
    affectedAreaSqm: 420.0,
    riskLevel: 'HIGH',
    status: 'UNDER_REVIEW',

    aiAnalysis: {
      modelName: 'PeykGöz SAR U-Net Segmentation',
      modelVersion: 'v2.1.4-eval',
      modelConfidence: 0.87, // 87% Model Confidence (Not legal guarantee)
      pixelProbabilityAvg: 0.84,
      thresholdApplied: 0.75,
      originalSarImageUrl: '/assets/mock/sar_scene_20260810_raw.png',
      segmentedMaskUrl: '/assets/mock/sar_scene_20260810_mask.png',
      polygonGeoJson: null,
      detectedAreaSqm: 420.0,
      processingTimestamp: '2026-08-10T10:36:12Z',
      qualityFlags: ['NO_SPECKLE_FILTER_NOISE', 'CLEAR_CONTRAST'],
    },

    weather: {
      windSpeedKmH: 18.5,
      windDirectionDeg: 140, // SE
      seaStateScale: 2,
      temperatureC: 28.4,
      timestamp: '2026-08-10T10:30:00Z',
      source: 'National Hydromet Center Telemetry',
      isLookAlikeRiskHigh: false, // Wind > 10 km/h -> reduces low-wind lookalike probability
    },

    nearbyVessels: [
      {
        id: 'vsl-101',
        name: 'CASPIAN TUG 4',
        mmsi: '211345000',
        distanceKm: 1.8,
        speedKnots: 8.2,
        headingDegrees: 215,
        lastReported: '2026-08-10T10:32:00Z',
        relevanceLabel: 'Potentially Relevant Vessel',
      },
      {
        id: 'vsl-102',
        name: 'SHAH DENIZ SUPPLY',
        mmsi: '211988120',
        distanceKm: 3.4,
        speedKnots: 0.1,
        headingDegrees: 90,
        lastReported: '2026-08-10T10:34:00Z',
        relevanceLabel: 'In Proximity',
      },
    ],

    humanReview: {
      reviewerName: 'R. Məmmədov (Böyük Analitik)',
      decision: 'ACCEPT',
      decisionTimestamp: '2026-08-10T10:42:00Z',
      confidenceScore: 'HIGH',
      rationale: 'Külək sürəti (18.5 km/saat) aşağı-külək aldanması (low-wind lookalike) riskini istisna edir. Ərazidə tanker marşrutu var. Təmizlik komandasına xəbərdarlıq göndərilməlidir.',
      overrodeAI: false,
    },

    assignedTeam: 'Xəzər Dəniz Fövqəladə Təmizlik Briqadası #2',

    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-08-10T10:35:00Z',
        title: 'Peyk Şəkli Emal Edildi',
        description: 'Sentinel-1 SAR təsviri akvatoriya üzrə skan olundu.',
        actor: 'Copernicus Ingestion Pipeline',
        category: 'SYSTEM',
      },
      {
        id: 'tl-2',
        timestamp: '2026-08-10T10:36:12Z',
        title: 'AI Anomaliya Aşkarladı',
        description: 'U-Net modeli 87% ehtimalla 420 m² sahədə şübhəli ləkə təyin etdi.',
        actor: 'PeykGöz AI Engine',
        category: 'AI',
      },
      {
        id: 'tl-3',
        timestamp: '2026-08-10T10:42:00Z',
        title: 'Analitik Təsdiq Etib',
        description: 'Böyük analitik tərəfindən subyektiv qiymətləndirmə aparıldı və status Yüksək Risk olaraq təyin olundu.',
        actor: 'R. Məmmədov',
        category: 'ANALYST',
      },
    ],

    sorbentRecord: {
      materialName: 'Pambıq Linteri və Qoz Qabığı Biomahsulu',
      amountUsedKg: 85,
      estimatedOilUptakeLiters: 320,
      collectionTimestamp: '2026-08-10T12:00:00Z',
      pyrolysisFeasibilityId: 'pyr-test-08',
    },
  },
  {
    id: 'inc-024',
    code: '#PG-2026-024',
    title: 'Səngəçal Terminalı Yaxınlığında Analiz',
    locationName: 'Səngəçal Sahil Zonu',
    coordinates: { lat: 40.1788, lng: 49.4612 },
    detectedAt: '2026-08-09T18:12:00Z',
    affectedAreaSqm: 1150.0,
    riskLevel: 'MEDIUM',
    status: 'CLEANING_IN_PROGRESS',

    aiAnalysis: {
      modelName: 'PeykGöz SAR U-Net Segmentation',
      modelVersion: 'v2.1.4-eval',
      modelConfidence: 0.74,
      pixelProbabilityAvg: 0.71,
      thresholdApplied: 0.70,
      originalSarImageUrl: '/assets/mock/sar_scene_20260809_raw.png',
      segmentedMaskUrl: '/assets/mock/sar_scene_20260809_mask.png',
      polygonGeoJson: null,
      detectedAreaSqm: 1150.0,
      processingTimestamp: '2026-08-09T18:13:00Z',
      qualityFlags: ['LOW_WIND_MODERATE_RISK'],
    },

    weather: {
      windSpeedKmH: 7.2,
      windDirectionDeg: 90,
      seaStateScale: 1,
      temperatureC: 29.1,
      timestamp: '2026-08-09T18:10:00Z',
      source: 'National Hydromet Center Telemetry',
      isLookAlikeRiskHigh: true, // Low wind speeds might mimic oil slicks
    },

    nearbyVessels: [],

    timeline: [
      {
        id: 'tl-10',
        timestamp: '2026-08-09T18:12:00Z',
        title: 'Təsvir Qəbul Olundu',
        description: 'Sentinel-1B keçidindən alınan radar təsviri.',
        actor: 'Copernicus Pipeline',
        category: 'SYSTEM',
      },
      {
        id: 'tl-11',
        timestamp: '2026-08-09T19:00:00Z',
        title: 'Sahə Komandası Göndərildi',
        description: 'Bio-sorbent tətbiqi üçün dəniz patrulu əraziyə çatdı.',
        actor: 'Response Team #1',
        category: 'FIELD',
      },
    ],
  },
];

export const MOCK_KPIS: DashboardKPIs = {
  activeIncidentsCount: 2,
  highRiskCount: 1,
  mediumRiskCount: 1,
  resolvedCount: 14,
  totalAffectedAreaSqm: 1570.0,
  avgResponseTimeMinutes: 24,
  avgAIConfidencePercentage: 80.5,
};