"use client";

/**
 * EmergencyAlerts component.
 *
 * Location: frontend/src/components/firebase/EmergencyAlerts.tsx
 *
 * Displays active emergency alerts received from the ESP32 devices via
 * Firebase Realtime Database. Each alert shows severity, message, bus ID,
 * GPS link (if coordinates available), and a dismiss/acknowledge button.
 */

import { useState } from "react";
import { AlertTriangle, X, MapPin, Bus } from "lucide-react";
import { acknowledgeAlert } from "@/services/firebase-service";
import type { EmergencyAlert } from "@/types/firebase";

interface EmergencyAlertsProps {
  alerts: EmergencyAlert[];
  loading?: boolean;
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; badge: string; icon: string }> = {
  critical: {
    border: "border-rose-500/60",
    bg: "bg-rose-500/10",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    icon: "text-rose-400",
  },
  high: {
    border: "border-orange-500/60",
    bg: "bg-orange-500/10",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
    icon: "text-orange-400",
  },
  medium: {
    border: "border-amber-500/60",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    icon: "text-amber-400",
  },
  low: {
    border: "border-slate-500/40",
    bg: "bg-slate-500/10",
    badge: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    icon: "text-slate-400",
  },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function EmergencyAlerts({ alerts, loading = false }: EmergencyAlertsProps) {
  // Track locally dismissed alert keys (optimistic UI before Firebase confirms)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter(
    (a) => !a.acknowledged && !dismissed.has(a._key ?? ""),
  );

  async function handleAcknowledge(alert: EmergencyAlert) {
    if (!alert._key) return;
    setDismissed((s) => new Set([...s, alert._key!]));
    try {
      await acknowledgeAlert(alert._key);
    } catch {
      // Revert optimistic dismiss on failure
      setDismissed((s) => {
        const next = new Set(s);
        next.delete(alert._key!);
        return next;
      });
    }
  }

  return (
    <div className="firebase-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="panel-title">Emergency Alerts</h3>
        </div>
        {activeAlerts.length > 0 && (
          <span className="flex items-center gap-1 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full px-2 py-0.5 font-semibold animate-pulse">
            {activeAlerts.length} active
          </span>
        )}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rfid-skeleton h-20 animate-pulse rounded-xl" />
          ))
        ) : activeAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-400 font-medium">All Clear</p>
            <p className="text-xs text-slate-500 mt-1">No active emergency alerts</p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const styles = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.low;
            return (
              <div
                key={alert._key}
                className={`rounded-xl border p-4 ${styles.border} ${styles.bg} relative transition-all duration-300`}
              >
                {/* Severity badge + dismiss */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {alert.severity}
                  </span>
                  <button
                    onClick={() => void handleAcknowledge(alert)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
                    aria-label="Acknowledge alert"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Message */}
                <p className={`text-sm font-medium ${styles.icon} mb-2 leading-snug`}>
                  {alert.message}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    {alert.bus_id}
                  </span>
                  {alert.latitude != null && alert.longitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      View on map
                    </a>
                  )}
                  <span>{formatTime(alert.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
