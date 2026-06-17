"use client";

/**
 * useBusDashboard hook.
 *
 * Location: frontend/src/hooks/use-bus-dashboard.ts
 *
 * Orchestrates Firebase realtime data into a clean dashboard state object.
 * Derives occupancy percentage, extracts RFID scans from bus logs, and
 * surfaces the latest GPS fix and passenger count in a single hook.
 *
 * Consumers: the ESP32 Dashboard page and any widget that needs live bus data.
 */

import { useMemo } from "react";
import { useFirebaseTelemetry } from "@/hooks/use-firebase-telemetry";
import type { DashboardState, BusLog } from "@/types/firebase";

const DEFAULT_CAPACITY = 60;

/**
 * @param busId – optional bus identifier to scope GPS and passenger listeners.
 *                When omitted, the dashboard shows aggregate data across all buses.
 */
export function useBusDashboard(busId?: string): DashboardState {
  const { busLogs, emergencyAlerts, gpsTracking, passengerStats, loading, error } =
    useFirebaseTelemetry(busId);

  // Extract only card_tap events from the log feed for the RFID scan panel
  const rfidScans = useMemo(
    () =>
      busLogs.filter(
        (log): log is BusLog & { _key: string } => log.event_type === "card_tap",
      ),
    [busLogs],
  );

  // Passenger count — prefer the dedicated stats node if a busId is watched
  const currentCount = passengerStats?.current_count ?? (() => {
    // Fallback: find the most recent passenger_count event in the logs
    const last = busLogs.find((l) => l.event_type === "passenger_count");
    return last?.passenger_count ?? 0;
  })();

  const capacity = passengerStats?.capacity ?? DEFAULT_CAPACITY;
  const occupancyPct =
    passengerStats?.occupancy_pct ??
    (capacity > 0 ? Math.min(100, Math.round((currentCount / capacity) * 100)) : 0);

  // GPS — prefer the dedicated gps_tracking node if a busId is watched
  const gpsLocation = gpsTracking
    ? { lat: gpsTracking.latitude, lng: gpsTracking.longitude, speed: gpsTracking.speed }
    : (() => {
        // Fallback: latest GPS event from the log feed
        const last = busLogs.find(
          (l) => l.event_type === "gps_update" && l.latitude != null,
        );
        return last?.latitude != null
          ? { lat: last.latitude, lng: last.longitude ?? 0 }
          : null;
      })();

  // Derive last update time from the most recent log entry
  const lastUpdated = busLogs[0]
    ? new Date(busLogs[0].timestamp * 1000)
    : null;

  return {
    passengerCount: currentCount,
    capacity,
    occupancyPct,
    gpsLocation,
    rfidScans,
    emergencyAlerts,
    lastUpdated,
    isConnected: !loading && !error,
  };
}
