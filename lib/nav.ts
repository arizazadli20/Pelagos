export type NavId =
  | "dashboard"
  | "incidents"
  | "vessels"
  | "ai"
  | "response"
  | "reports"
  | "account";

export const NAV_ROUTES: Record<NavId, string> = {
  dashboard: "/dashboard",
  incidents: "/incidents",
  vessels: "/vessels",
  ai: "/ai-analysis",
  response: "/response",
  reports: "/reports",
  account: "/account",
};

/** All operational routes are live in Phase 3. */
export const ENABLED_NAV: NavId[] = [
  "dashboard",
  "incidents",
  "vessels",
  "ai",
  "response",
  "reports",
  "account",
];
