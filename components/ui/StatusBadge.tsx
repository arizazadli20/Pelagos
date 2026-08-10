"use client";

import type { IncidentStatus } from "@/lib/types";
import { INCIDENT_STATUS_LABEL } from "@/lib/mock-data";

type Props = {
  status: IncidentStatus | string;
  label?: string;
};

export default function StatusBadge({ status, label }: Props) {
  const text = label ?? INCIDENT_STATUS_LABEL[status as IncidentStatus] ?? status;
  return <span className={`pill pill-${status}`}>{text}</span>;
}
