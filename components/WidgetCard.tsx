"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  dragHandleClass?: string;
  editMode?: boolean;
};

export default function WidgetCard({ title, children, icon, dragHandleClass = "widget-header", editMode = false }: Props) {
  return (
    <div className={`widget-card${editMode ? " widget-card--editing" : ""}`}>
      <div className={dragHandleClass} style={{ cursor: editMode ? "grab" : "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && <div style={{ color: "var(--accent-teal)", display: "flex", opacity: 0.8 }}>{icon}</div>}
          <span style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            {title}
          </span>
        </div>
        {/* Six-dot drag grip — only visible in edit mode */}
        <svg
          className={`drag-dots${editMode ? " drag-dots--visible" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="4"  cy="3"  r="1.3" fill="currentColor"/>
          <circle cx="10" cy="3"  r="1.3" fill="currentColor"/>
          <circle cx="4"  cy="7"  r="1.3" fill="currentColor"/>
          <circle cx="10" cy="7"  r="1.3" fill="currentColor"/>
          <circle cx="4"  cy="11" r="1.3" fill="currentColor"/>
          <circle cx="10" cy="11" r="1.3" fill="currentColor"/>
        </svg>
      </div>

      {/* Scrollable content area */}
      <div className="widget-body">
        {children}
      </div>
    </div>
  );
}
