// ============================================================
// Live wind / sea-state context from Open-Meteo (no API key).
// Used to enrich incident detail views with real environmental
// data at the incident's location and time.
// ============================================================

export type WindContext = {
  windSpeedKnots: number;
  windHeading: number;
  temperatureC: number;
  visibilityKm: number;
  sourceTimestamp: string;
  staleMinutes: number;
};

export type SeaState = {
  seaState: string;
  waveHeightM: number;
  wavePeriodS: number;
  sourceTimestamp: string;
  staleMinutes: number;
};

/** Index of the hourly entry closest to targetIso, plus how far away it is (minutes). */
function findClosestHourly(
  times: unknown,
  targetIso: string
): { idx: number; staleMinutes: number } | null {
  if (!Array.isArray(times) || times.length === 0) return null;

  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;

  let bestIdx = -1;
  let bestDiffMs = Infinity;

  for (let i = 0; i < times.length; i++) {
    const raw = times[i];
    if (typeof raw !== "string") continue;
    const t = new Date(raw.endsWith("Z") ? raw : `${raw}Z`).getTime();
    if (Number.isNaN(t)) continue;
    const diff = Math.abs(t - target);
    if (diff < bestDiffMs) {
      bestDiffMs = diff;
      bestIdx = i;
    }
  }

  if (bestIdx === -1) return null;
  return { idx: bestIdx, staleMinutes: Math.round(bestDiffMs / 60000) };
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

export async function getWindContext(
  lat: number,
  lng: number,
  timestampIso: string
): Promise<WindContext | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set(
      "hourly",
      "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility"
    );
    url.searchParams.set(
      "current",
      "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
    );
    url.searchParams.set("past_days", "16");
    url.searchParams.set("wind_speed_unit", "kn");
    url.searchParams.set("timezone", "UTC");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const json = await res.json();
    const hourly = json?.hourly;
    const match = findClosestHourly(hourly?.time, timestampIso);
    if (!match) return null;

    const windSpeedKnots = toNumber(hourly?.wind_speed_10m?.[match.idx]);
    const windHeading = toNumber(hourly?.wind_direction_10m?.[match.idx]);
    const temperatureC = toNumber(hourly?.temperature_2m?.[match.idx]);
    const visibilityM = toNumber(hourly?.visibility?.[match.idx]);

    if (
      windSpeedKnots === null ||
      windHeading === null ||
      temperatureC === null ||
      visibilityM === null
    ) {
      return null;
    }

    return {
      windSpeedKnots: Math.round(windSpeedKnots * 10) / 10,
      windHeading: Math.round(windHeading),
      temperatureC: Math.round(temperatureC * 10) / 10,
      visibilityKm: Math.round((visibilityM / 1000) * 10) / 10,
      sourceTimestamp: hourly.time[match.idx],
      staleMinutes: match.staleMinutes,
    };
  } catch {
    return null;
  }
}

function waveHeightLabel(waveHeightM: number): string {
  if (waveHeightM < 0.1) return "Calm";
  if (waveHeightM <= 0.3) return "Slight";
  if (waveHeightM <= 0.5) return "Moderate";
  return "Rough";
}

export async function getSeaState(
  lat: number,
  lng: number,
  timestampIso: string
): Promise<SeaState | null> {
  try {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("hourly", "wave_height,wave_direction,wave_period");
    url.searchParams.set("models", "best_match");
    url.searchParams.set("past_days", "16");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const json = await res.json();
    const hourly = json?.hourly;
    const match = findClosestHourly(hourly?.time, timestampIso);
    if (!match) return null;

    const waveHeightM = toNumber(hourly?.wave_height?.[match.idx]);
    const wavePeriodS = toNumber(hourly?.wave_period?.[match.idx]);

    if (waveHeightM === null || wavePeriodS === null) return null;

    return {
      seaState: waveHeightLabel(waveHeightM),
      waveHeightM: Math.round(waveHeightM * 100) / 100,
      wavePeriodS: Math.round(wavePeriodS * 10) / 10,
      sourceTimestamp: hourly.time[match.idx],
      staleMinutes: match.staleMinutes,
    };
  } catch {
    return null;
  }
}
