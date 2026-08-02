"use client";

import { ReactNode, useState, useEffect } from "react";

type Props = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  dragHandleClass?: string;
  editMode?: boolean;
  updatedAt?: string | Date;
};

function formatRelativeTime(date: Date): string {
  const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function WidgetCard({ title, children, icon, dragHandleClass = "widget-header", editMode = false, updatedAt }: Props) {
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    if (!updatedAt) return;
    const date = new Date(updatedAt);
    
    const update = () => setRelativeTime(formatRelativeTime(date));
    update();
    
    // Refresh every 10 seconds
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [updatedAt]);
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
          {/* Last Updated Indicator */}
          {updatedAt && !editMode && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "auto",
              color: "var(--text-secondary)",
              fontSize: "10px",
              fontWeight: 500
            }} title={`Last updated: ${new Date(updatedAt).toLocaleString()}`}>
              Updated {relativeTime}
            </div>
          )}
          
          {/* Six-dot drag grip — only visible in edit mode */}
          <svg
            className={`drag-dots${editMode ? " drag-dots--visible" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            style={{ marginLeft: updatedAt ? "8px" : "auto" }}
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
