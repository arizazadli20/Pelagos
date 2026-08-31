"use client";

import { useEffect, useState } from "react";
import type { Incident } from "@/lib/types";
import { getWindContext, getSeaState, type WindContext, type SeaState } from "@/lib/weather";
import { estimateSpillSource, type SpillSourceResult } from "@/lib/spill-physics";

type Result = {
  wind: WindContext | null;
  sea: SeaState | null;
  estimate: SpillSourceResult | null;
  loading: boolean;
};

/** Live wind/sea context plus the derived upwind source estimate for one incident. */
export function useSpillSourceEstimate(incident: Incident | null | undefined): Result {
  const [wind, setWind] = useState<WindContext | null>(null);
  const [sea, setSea] = useState<SeaState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!incident) {
      setWind(null);
      setSea(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setWind(null);
    setSea(null);
    Promise.all([
      getWindContext(incident.lat, incident.lng, incident.timestamp),
      getSeaState(incident.lat, incident.lng, incident.timestamp),
    ]).then(([w, s]) => {
      if (cancelled) return;
      setWind(w);
      setSea(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [incident?.id, incident?.lat, incident?.lng, incident?.timestamp]);

  const estimate = incident ? estimateSpillSource(incident, wind, sea) : null;

  return { wind, sea, estimate, loading };
}
