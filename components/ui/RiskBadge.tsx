"use client";

import type { RiskLevel } from "@/lib/types";

type Props = {
  risk: RiskLevel;
};

export default function RiskBadge({ risk }: Props) {
  const cls =
    risk === "HIGH"
      ? "pill pill-high"
      : risk === "MEDIUM"
        ? "pill pill-medium"
        : "pill pill-low";
  return <span className={cls}>{risk}</span>;
}
