"use client";

/**
 * TelemetryCard component.
 *
 * Location: frontend/src/components/firebase/TelemetryCard.tsx
 *
 * A reusable metric card that displays a single telemetry value (passenger
 * count, GPS coordinates, etc.) with an icon, label, animated live indicator,
 * and optional trend/unit text.
 */

import { type ReactNode } from "react";

interface TelemetryCardProps {
  /** Card header label */
  label: string;
  /** The main value to display */
  value: string | number;
  /** Optional sub-text below the value (unit, coordinates, etc.) */
  subtext?: string;
  /** Lucide-react or any ReactNode icon */
  icon: ReactNode;
  /** Accent colour class for the icon background — e.g. "bg-blue-500/20 text-blue-400" */
  accentClass?: string;
  /** Show animated live pulse indicator */
  isLive?: boolean;
  /** Optional trend badge text e.g. "+3 from last stop" */
  trend?: string;
  /** Optional trend sentiment for colour coding */
  trendType?: "positive" | "negative" | "neutral";
  /** Card is in loading/skeleton state */
  loading?: boolean;
}

export function TelemetryCard({
  label,
  value,
  subtext,
  icon,
  accentClass = "bg-indigo-500/20 text-indigo-400",
  isLive = false,
  trend,
  trendType = "neutral",
  loading = false,
}: TelemetryCardProps) {
  const trendColour =
    trendType === "positive"
      ? "text-emerald-400"
      : trendType === "negative"
        ? "text-rose-400"
        : "text-slate-400";

  if (loading) {
    return (
      <div className="telemetry-card animate-pulse">
        <div className="h-4 w-24 rounded bg-white/10 mb-4" />
        <div className="h-10 w-20 rounded bg-white/10 mb-2" />
        <div className="h-3 w-32 rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className="telemetry-card group">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="telemetry-label">{label}</span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="live-dot" />
            LIVE
          </span>
        )}
      </div>

      {/* Icon + value */}
      <div className="flex items-end gap-4">
        <div className={`telemetry-icon-wrap ${accentClass}`}>{icon}</div>
        <div>
          <p className="telemetry-value">{value}</p>
          {subtext && <p className="telemetry-subtext">{subtext}</p>}
        </div>
      </div>

      {/* Trend badge */}
      {trend && (
        <p className={`mt-3 text-xs font-medium ${trendColour}`}>{trend}</p>
      )}
    </div>
  );
}
