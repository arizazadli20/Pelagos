// ============================================================
// TIKVA Mock Data
// ============================================================
// To swap for a real API, replace this file with a module that
// exports the same `mockData` object shape, fetching from your
// backend (Sentinel-1 scenes, detection model results, AIS, etc.)
// ============================================================

export type Port = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type DetectionStatus =
  | "detected"
  | "alert_sent"
  | "collected"
  | "converted";

export type Detection = {
  id: string;
  portId: string;
  lat: number;
  lng: number;
  timestamp: string;
  confidenceScore: number;
  areaKm2: number;
  status: DetectionStatus;
  incidentId: string;
  reportStatus: "Pending" | "Sent" | "Acknowledged";
  alertLatencyMin: number;
};

export type KPIs = {
  detectionAccuracy: number;
  avgAlertLatencyMin: number;
  conversionRate: number;
};

export type ActivityEntry = {
  timestamp: string;
  event: string;
  portId: string;
  type: "detection" | "alert" | "dispatch" | "collection" | "conversion" | "info";
  incidentId?: string;
};

export type ConversionEntry = {
  date: string;
  sorbentCollectedKg: number;
  convertedKg: number;
  bitumenModifierKg: number;
  activatedCarbonKg: number;
};

export type VesselStatus = "In port" | "Approaching" | "Transiting";

export type Vessel = {
  id: string;
  name: string;
  portId: string;
  lat: number;
  lng: number;
  distanceKm: number;
  speedKnots: number;
  heading: number; // degrees 0-359
  status: VesselStatus;
  type: string;
};

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertMessage = {
  id: string;
  severity: AlertSeverity;
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
};

export type ResourceStatus = {
  portId: string;
  boomTotalMeters: number;
  boomDeployedMeters: number;
  sorbentTotalKg: number;
  sorbentReservedKg: number;
  teamsTotal: number;
  teamsDeployed: number;
  teams: { id: string; name: string; status: "Deployed" | "Available" | "Off-duty" }[];
  vesselsEquipped: number;
  vesselsNames: string[];
};

export type WeatherForecast = {
  portId: string;
  windSpeedKnots: number;
  windHeading: number;
  currentSpeedKnots: number;
  currentHeading: number;
};

export type TrendData = {
  date: string;
  cumulativeArea: number;
  incidentCount: number;
};

export const mockData = {
  ports: [
    { id: "baku",    name: "Baku Port",    lat: 40.37,  lng: 49.85  },
    { id: "sumgait", name: "Sumgait Port", lat: 40.59,  lng: 49.64  },
    { id: "alyat",   name: "Alyat Port",   lat: 39.96,  lng: 49.42  },
  ] as Port[],

  alerts: [
    {
      id: "alert-1",
      severity: "critical",
      message: "Unidentified spill detected near main channel.",
      location: "Baku Port",
      timestamp: "2026-08-03T02:15:00Z",
      acknowledged: false,
    },
    {
      id: "alert-2",
      severity: "high",
      message: "Vessel 'MT Caspian' entered high risk zone.",
      location: "Baku Port",
      timestamp: "2026-08-03T01:45:00Z",
      acknowledged: false,
    },
    {
      id: "alert-3",
      severity: "medium",
      message: "Sorbent stock running low (25% remaining).",
      location: "Alyat Port",
      timestamp: "2026-08-02T10:30:00Z",
      acknowledged: true,
    }
  ] as AlertMessage[],

  resources: [
    {
      portId: "baku",
      boomTotalMeters: 5000,
      boomDeployedMeters: 1200,
      sorbentTotalKg: 2000,
      sorbentReservedKg: 450,
      teamsTotal: 5,
      teamsDeployed: 2,
      teams: [
        { id: "t1", name: "Alpha Response", status: "Deployed" },
        { id: "t2", name: "Bravo Team", status: "Deployed" },
        { id: "t3", name: "Charlie Team", status: "Available" },
        { id: "t4", name: "Delta Team", status: "Available" },
        { id: "t5", name: "Echo Team", status: "Off-duty" }
      ],
      vesselsEquipped: 3,
      vesselsNames: ["MT Caspian", "Tug SV-12", "Response V-1"]
    }
  ] as ResourceStatus[],

  weather: [
    {
      portId: "baku",
      windSpeedKnots: 12,
      windHeading: 220, // blowing to SW
      currentSpeedKnots: 1.5,
      currentHeading: 240,
    }
  ] as WeatherForecast[],

  trends: [
    { date: "Jul 27", cumulativeArea: 0.1, incidentCount: 1 },
    { date: "Jul 28", cumulativeArea: 0.15, incidentCount: 2 },
    { date: "Jul 29", cumulativeArea: 0.32, incidentCount: 4 },
    { date: "Jul 30", cumulativeArea: 0.58, incidentCount: 5 },
    { date: "Jul 31", cumulativeArea: 0.85, incidentCount: 7 },
    { date: "Aug 01", cumulativeArea: 1.12, incidentCount: 9 },
    { date: "Aug 02", cumulativeArea: 1.25, incidentCount: 11 },
    { date: "Aug 03", cumulativeArea: 1.42, incidentCount: 12 },
  ] as TrendData[],

  detections: [
    {
      id: "det-001",
      incidentId: "INC-20260711-A",
      reportStatus: "Sent",
      portId: "baku",
      lat: 40.368,
      lng: 49.847,
      timestamp: "2026-07-24T06:12:00Z",
      confidenceScore: 0.91,
      areaKm2: 0.42,
      status: "converted",
      alertLatencyMin: 14,
    },
    {
      id: "det-002",
      incidentId: "INC-20260712-A",
      reportStatus: "Acknowledged",
      portId: "baku",
      lat: 40.373,
      lng: 49.858,
      timestamp: "2026-07-21T14:35:00Z",
      confidenceScore: 0.87,
      areaKm2: 0.28,
      status: "converted",
      alertLatencyMin: 19,
    },
    {
      id: "det-003",
      incidentId: "INC-20260713-A",
      reportStatus: "Pending",
      portId: "sumgait",
      lat: 40.592,
      lng: 49.637,
      timestamp: "2026-07-19T09:48:00Z",
      confidenceScore: 0.94,
      areaKm2: 0.61,
      status: "collected",
      alertLatencyMin: 12,
    },
    {
      id: "det-004",
      incidentId: "INC-20260714-A",
      reportStatus: "Sent",
      portId: "baku",
      lat: 40.364,
      lng: 49.843,
      timestamp: "2026-07-17T17:22:00Z",
      confidenceScore: 0.79,
      areaKm2: 0.15,
      status: "converted",
      alertLatencyMin: 28,
    },
    {
      id: "det-005",
      incidentId: "INC-20260715-A",
      reportStatus: "Acknowledged",
      portId: "alyat",
      lat: 39.958,
      lng: 49.418,
      timestamp: "2026-07-15T04:55:00Z",
      confidenceScore: 0.88,
      areaKm2: 0.33,
      status: "converted",
      alertLatencyMin: 16,
    },
    {
      id: "det-006",
      incidentId: "INC-20260716-A",
      reportStatus: "Pending",
      portId: "baku",
      lat: 40.375,
      lng: 49.852,
      timestamp: "2026-07-12T11:30:00Z",
      confidenceScore: 0.82,
      areaKm2: 0.22,
      status: "collected",
      alertLatencyMin: 21,
    },
    {
      id: "det-007",
      incidentId: "INC-20260717-A",
      reportStatus: "Sent",
      portId: "sumgait",
      lat: 40.589,
      lng: 49.641,
      timestamp: "2026-07-10T08:14:00Z",
      confidenceScore: 0.96,
      areaKm2: 0.74,
      status: "converted",
      alertLatencyMin: 11,
    },
    {
      id: "det-008",
      incidentId: "INC-20260718-A",
      reportStatus: "Acknowledged",
      portId: "baku",
      lat: 40.371,
      lng: 49.849,
      timestamp: "2026-07-08T22:05:00Z",
      confidenceScore: 0.85,
      areaKm2: 0.38,
      status: "converted",
      alertLatencyMin: 18,
    },
    {
      id: "det-009",
      incidentId: "INC-20260719-A",
      reportStatus: "Pending",
      portId: "alyat",
      lat: 39.962,
      lng: 49.422,
      timestamp: "2026-07-05T13:40:00Z",
      confidenceScore: 0.78,
      areaKm2: 0.19,
      status: "alert_sent",
      alertLatencyMin: 25,
    },
    {
      id: "det-010",
      incidentId: "INC-20260720-A",
      reportStatus: "Sent",
      portId: "baku",
      lat: 40.366,
      lng: 49.845,
      timestamp: "2026-07-02T07:18:00Z",
      confidenceScore: 0.93,
      areaKm2: 0.55,
      status: "converted",
      alertLatencyMin: 13,
    },
  ] as Detection[],

  kpis: {
    detectionAccuracy: 0.874,
    avgAlertLatencyMin: 18,
    conversionRate: 0.63,
  } as KPIs,

  activityLog: [
    {
      timestamp: "2026-07-24T06:12:00Z",
      event: "Oil spill detected — Baku Port — 91% confidence",
      portId: "baku",
      type: "detection",
    },
    {
      timestamp: "2026-07-24T06:26:00Z",
      event: "Alert sent to Port Authority response team — +14 min",
      portId: "baku",
      type: "alert",
    },
    {
      timestamp: "2026-07-24T06:34:00Z",
      event: "Collection team dispatched — bio-sorbent boom deployed — +22 min",
      portId: "baku",
      type: "dispatch",
    },
    {
      timestamp: "2026-07-24T08:10:00Z",
      event: "Sorbent collection complete — 340 kg recovered",
      portId: "baku",
      type: "collection",
    },
    {
      timestamp: "2026-07-24T09:00:00Z",
      event: "Pyrolysis conversion started — 340 kg saturated sorbent",
      portId: "baku",
      type: "conversion",
    },
    {
      timestamp: "2026-07-21T14:35:00Z",
      event: "Oil spill detected — Baku Port — 87% confidence",
      portId: "baku",
      type: "detection",
    },
    {
      timestamp: "2026-07-21T14:54:00Z",
      event: "Alert sent to response team — +19 min",
      portId: "baku",
      type: "alert",
    },
    {
      timestamp: "2026-07-19T09:48:00Z",
      event: "Oil spill detected — Sumgait Port — 94% confidence",
      portId: "sumgait",
      type: "detection",
    },
    {
      timestamp: "2026-07-19T10:00:00Z",
      event: "Alert sent — +12 min. Largest spill this week (0.61 km²)",
      portId: "sumgait",
      type: "alert",
    },
    {
      timestamp: "2026-07-15T04:55:00Z",
      event: "Oil spill detected — Alyat Port — 88% confidence",
      portId: "alyat",
      type: "detection",
    },
    {
      timestamp: "2026-07-15T05:11:00Z",
      event: "Alert sent — +16 min. 220 kg sorbent deployed",
      portId: "alyat",
      type: "alert",
    },
    {
      timestamp: "2026-07-10T08:14:00Z",
      event: "Oil spill detected — Sumgait Port — 96% confidence (highest this pilot)",
      portId: "sumgait",
      type: "detection",
    },
    {
      timestamp: "2026-07-10T08:25:00Z",
      event: "Alert sent — +11 min. Fastest response this pilot",
      portId: "sumgait",
      type: "alert",
    },
    {
      timestamp: "2026-07-10T11:40:00Z",
      event: "Conversion complete — 490 kg → 185 kg bitumen modifier + 125 kg activated carbon",
      portId: "sumgait",
      type: "conversion",
    },
  ] as ActivityEntry[],

  conversionLog: [
    {
      date: "2026-07-02",
      sorbentCollectedKg: 360,
      convertedKg: 228,
      bitumenModifierKg: 132,
      activatedCarbonKg: 96,
    },
    {
      date: "2026-07-05",
      sorbentCollectedKg: 125,
      convertedKg: 79,
      bitumenModifierKg: 46,
      activatedCarbonKg: 33,
    },
    {
      date: "2026-07-08",
      sorbentCollectedKg: 248,
      convertedKg: 157,
      bitumenModifierKg: 91,
      activatedCarbonKg: 66,
    },
    {
      date: "2026-07-10",
      sorbentCollectedKg: 490,
      convertedKg: 310,
      bitumenModifierKg: 185,
      activatedCarbonKg: 125,
    },
    {
      date: "2026-07-12",
      sorbentCollectedKg: 145,
      convertedKg: 92,
      bitumenModifierKg: 54,
      activatedCarbonKg: 38,
    },
    {
      date: "2026-07-15",
      sorbentCollectedKg: 220,
      convertedKg: 139,
      bitumenModifierKg: 81,
      activatedCarbonKg: 58,
    },
    {
      date: "2026-07-17",
      sorbentCollectedKg: 98,
      convertedKg: 62,
      bitumenModifierKg: 36,
      activatedCarbonKg: 26,
    },
    {
      date: "2026-07-19",
      sorbentCollectedKg: 400,
      convertedKg: 253,
      bitumenModifierKg: 147,
      activatedCarbonKg: 106,
    },
    {
      date: "2026-07-21",
      sorbentCollectedKg: 183,
      convertedKg: 116,
      bitumenModifierKg: 67,
      activatedCarbonKg: 49,
    },
    {
      date: "2026-07-24",
      sorbentCollectedKg: 340,
      convertedKg: 0,
      bitumenModifierKg: 0,
      activatedCarbonKg: 0,
    },
  ] as ConversionEntry[],

  vessels: [
    // Baku Port vessels
    { id: "v-001", name: "Kapitan Rashid",  portId: "baku",    lat: 40.372, lng: 49.856, distanceKm: 0.8,  speedKnots: 2.1,  heading: 45,  status: "Approaching", type: "Tanker" },
    { id: "v-002", name: "Neftchi",         portId: "baku",    lat: 40.368, lng: 49.848, distanceKm: 0.3,  speedKnots: 0.0,  heading: 180, status: "In port",     type: "Supply" },
    { id: "v-003", name: "Xazar Star",      portId: "baku",    lat: 40.380, lng: 49.870, distanceKm: 4.2,  speedKnots: 12.5, heading: 320, status: "Transiting",  type: "Cargo" },
    { id: "v-004", name: "Sahil",           portId: "baku",    lat: 40.365, lng: 49.843, distanceKm: 1.1,  speedKnots: 0.3,  heading: 90,  status: "In port",     type: "Patrol" },
    { id: "v-005", name: "Absheron",        portId: "baku",    lat: 40.390, lng: 49.880, distanceKm: 6.7,  speedKnots: 8.2,  heading: 215, status: "Transiting",  type: "Tanker" },
    // Sumgait Port vessels
    { id: "v-006", name: "Caspian Eagle",   portId: "sumgait", lat: 40.595, lng: 49.641, distanceKm: 0.5,  speedKnots: 1.0,  heading: 200, status: "Approaching", type: "Cargo" },
    { id: "v-007", name: "Sumgait-1",       portId: "sumgait", lat: 40.590, lng: 49.638, distanceKm: 0.2,  speedKnots: 0.0,  heading: 0,   status: "In port",     type: "Supply" },
    { id: "v-008", name: "Azeri Pride",     portId: "sumgait", lat: 40.605, lng: 49.652, distanceKm: 3.1,  speedKnots: 9.4,  heading: 160, status: "Transiting",  type: "Tanker" },
    // Alyat Port vessels
    { id: "v-009", name: "Southern Cross",  portId: "alyat",   lat: 39.962, lng: 49.424, distanceKm: 0.6,  speedKnots: 1.8,  heading: 30,  status: "Approaching", type: "Cargo" },
    { id: "v-010", name: "Alyat Ranger",    portId: "alyat",   lat: 39.958, lng: 49.420, distanceKm: 0.2,  speedKnots: 0.0,  heading: 270, status: "In port",     type: "Patrol" },
  ] as Vessel[],
};
