"use client";

import { useState } from "react";

const stages = [
  {
    id: 1,
    label: "Detection",
    sub: "Sentinel-1 SAR + AI",
    tooltip: "Satellite radar imagery processed by AI detects surface oil signatures in near-real-time.",
  },
  {
    id: 2,
    label: "Collection",
    sub: "Bio-sorbent boom",
    tooltip: "Rapid-response teams deploy bio-sorbent booms to physically recover spilled oil.",
  },
  {
    id: 3,
    label: "Conversion",
    sub: "Pyrolysis output",
    tooltip: "Saturated sorbent is converted via pyrolysis into bitumen modifier and activated carbon.",
  },
];

// The currently active step (1-indexed). In a real app this would come from props/state.
const ACTIVE = 3;

export default function StageTracker() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",   // top-align so connector lines stay at circle midpoint
        gap: 0,
      }}
    >
      {stages.map((s, i) => {
        const done  = s.id < ACTIVE;
        const isNow = s.id === ACTIVE;
        const isHovered = hoveredId === s.id;

        // Derive colours
        const circleColor = isNow
          ? "var(--color-low)"
          : done
          ? "var(--text-secondary)"
          : "var(--text-secondary)";

        const circleBg = isNow
          ? "rgba(34, 197, 94, 0.12)"
          : "transparent";

        const circleBorder = isNow
          ? "var(--color-low)"
          : done
          ? "var(--glass-border-light)"
          : "var(--glass-border)";

        const labelColor = isNow
          ? "var(--text-primary)"
          : "var(--text-secondary)";

        return (
          <div key={s.id} style={{ display: "flex", alignItems: "flex-start" }}>

            {/* Step pill */}
            <div
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Circle + labels, wrapped for hover target */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  background: isHovered ? "rgba(177, 178, 181, 0.06)" : "transparent",
                  transition: "background 0.18s ease",
                  cursor: "default",
                }}
              >
                {/* Circle — fixed top-anchored so connector line always aligns */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `1.5px solid ${circleBorder}`,
                    background: circleBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",   // fine-tune to align with first line of label
                    transition: "border-color 0.2s, background 0.2s",
                    /* Active step gets a soft glow ring */
                    boxShadow: isNow
                      ? "0 0 0 3px rgba(34,197,94,0.12)"
                      : "none",
                  }}
                >
                  {done ? (
                    /* Checkmark for completed steps */
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="var(--text-secondary)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: circleColor,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.id}
                    </span>
                  )}
                </div>

                {/* Labels block */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: isNow ? 600 : 500,
                      color: labelColor,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                      opacity: 0.75,
                      lineHeight: 1.3,
                      /* Allow sub-labels to wrap if they must, but it won't
                         displace the circle because the circle is flex-start */
                      maxWidth: "90px",
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "200px",
                    background: "rgba(26, 29, 41, 0.97)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    zIndex: 300,
                    pointerEvents: "none",
                  }}
                >
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(45deg)",
                      width: "8px",
                      height: "8px",
                      background: "rgba(26, 29, 41, 0.97)",
                      borderTop: "1px solid var(--glass-border)",
                      borderLeft: "1px solid var(--glass-border)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "5px",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.tooltip}
                  </div>
                </div>
              )}
            </div>

            {/* Connector line between steps */}
            {i < stages.length - 1 && (
              <div
                style={{
                  /* Vertically position connector at circle midpoint:
                     circle marginTop(1) + half circle(11) + padding-top(4) = 16px */
                  marginTop: "16px",
                  width: "40px",
                  height: "1px",
                  flexShrink: 0,
                  background: done
                    ? "var(--glass-border-light)"
                    : "var(--glass-border)",
                  position: "relative",
                }}
              >
                {/* Animated fill for completed connector */}
                {done && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--glass-border-light)",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
