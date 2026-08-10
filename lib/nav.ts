export type NavId =
  | "dashboard"
  | "incidents"
  | "vessels"
  | "ai"
  | "response"
  | "reports";

export const NAV_ROUTES: Record<NavId, string> = {
  dashboard: "/dashboard",
  incidents: "/incidents",
  vessels: "/vessels",
  ai: "/ai-analysis",
  response: "/response",
  reports: "/reports",
};

/** Routes implemented in the current phase. */
export const ENABLED_NAV: NavId[] = ["dashboard", "incidents"];
