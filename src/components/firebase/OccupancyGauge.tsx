"use client";

/**
 * OccupancyGauge component.
 *
 * Location: frontend/src/components/firebase/OccupancyGauge.tsx
 *
 * Animated SVG arc gauge that shows current bus occupancy percentage.
 * Colour transitions from green (low) → amber (medium) → rose (high/full).
 */

interface OccupancyGaugeProps {
  /** Current occupancy percentage 0–100 */
  percentage: number;
  /** Current passenger count */
  currentCount: number;
  /** Bus total capacity */
  capacity: number;
  loading?: boolean;
}

function getColour(pct: number): { stroke: string; text: string; label: string } {
  if (pct >= 90) return { stroke: "#f43f5e", text: "text-rose-400", label: "Full" };
  if (pct >= 70) return { stroke: "#f59e0b", text: "text-amber-400", label: "Busy" };
  if (pct >= 40) return { stroke: "#3b82f6", text: "text-blue-400", label: "Moderate" };
  return { stroke: "#10b981", text: "text-emerald-400", label: "Available" };
}

export function OccupancyGauge({
  percentage,
  currentCount,
  capacity,
  loading = false,
}: OccupancyGaugeProps) {
  const pct = Math.min(100, Math.max(0, percentage));
  const colour = getColour(pct);

  // SVG arc parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 240° (starting from 150° to 390°)
  const arcLength = circumference * (240 / 360);
  const dashOffset = arcLength - (arcLength * pct) / 100;

  return (
    <div className="firebase-panel flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex items-center justify-between w-full mb-1">
        <h3 className="panel-title">Bus Occupancy</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
          pct >= 90
            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
            : pct >= 70
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        }`}>
          {colour.label}
        </span>
      </div>

      {/* SVG Gauge */}
      <div className="relative">
        <svg width="160" height="130" viewBox="0 0 160 130">
          {/* Background arc */}
          <circle
            cx="80"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(150 80 90)"
          />
          {/* Value arc */}
          {!loading && (
            <circle
              cx="80"
              cy="90"
              r={radius}
              fill="none"
              stroke={colour.stroke}
              strokeWidth="12"
              strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(150 80 90)"
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease",
                filter: `drop-shadow(0 0 8px ${colour.stroke}80)`,
              }}
            />
          )}
          {/* Glow dot at arc tip */}
          {!loading && pct > 2 && (
            <circle
              cx="80"
              cy="90"
              r="6"
              fill={colour.stroke}
              style={{
                filter: `drop-shadow(0 0 6px ${colour.stroke})`,
                transform: `rotate(${150 + 240 * (pct / 100)}deg)`,
                transformOrigin: "80px 90px",
                transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
          {loading ? (
            <div className="w-12 h-6 bg-white/10 rounded animate-pulse" />
          ) : (
            <>
              <span className={`text-3xl font-bold tabular-nums ${colour.text}`}>
                {pct}%
              </span>
              <span className="text-xs text-slate-400 mt-0.5">occupancy</span>
            </>
          )}
        </div>
      </div>

      {/* Count row */}
      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{currentCount}</p>
          <p className="text-xs text-slate-400">on board</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-400 tabular-nums">{capacity}</p>
          <p className="text-xs text-slate-400">capacity</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${colour.stroke}88, ${colour.stroke})`,
            boxShadow: `0 0 8px ${colour.stroke}60`,
          }}
        />
      </div>
    </div>
  );
}
