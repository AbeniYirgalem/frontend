"use client";

/**
 * useFirebaseTelemetry hook.
 *
 * Location: frontend/src/hooks/use-firebase-telemetry.ts
 *
 * Subscribes to Firebase Realtime Database paths using onValue listeners.
 * Updates the component state in real-time whenever the ESP32 pushes new data.
 *
 * Listened paths:
 *   bus_logs/               – new telemetry events (card taps, emergencies, etc.)
 *   emergency_alerts/       – emergency alerts
 *   gps_tracking/{busId}   – GPS coordinates (if busId is provided)
 *   passenger_statistics/{busId} – passenger count (if busId is provided)
 *
 * Listeners are cleaned up automatically on component unmount.
 */

import { useEffect, useRef, useState } from "react";
import { ref, onValue, off, query, orderByChild, limitToLast } from "firebase/database";
import { database } from "@/lib/firebase";
import type {
  BusLog,
  EmergencyAlert,
  GpsTracking,
  PassengerStatistics,
} from "@/types/firebase";

export interface FirebaseTelemetryState {
  /** Latest 50 bus log events, newest first */
  busLogs: (BusLog & { _key: string })[];
  /** All emergency alerts, newest first */
  emergencyAlerts: EmergencyAlert[];
  /** Latest GPS fix for the watched bus */
  gpsTracking: GpsTracking | null;
  /** Latest passenger statistics for the watched bus */
  passengerStats: PassengerStatistics | null;
  /** True while the initial data load is in progress */
  loading: boolean;
  /** Connection error message, if any */
  error: string | null;
}

const INITIAL_STATE: FirebaseTelemetryState = {
  busLogs: [],
  emergencyAlerts: [],
  gpsTracking: null,
  passengerStats: null,
  loading: true,
  error: null,
};

/**
 * @param busId – optional bus identifier to scope GPS + passenger listeners.
 *                When omitted, those two listeners are not attached.
 */
export function useFirebaseTelemetry(busId?: string) {
  const [state, setState] = useState<FirebaseTelemetryState>(INITIAL_STATE);
  // Track how many listeners have completed their first load
  const loadedCountRef = useRef(0);
  const totalListeners = busId ? 4 : 2;

  useEffect(() => {
    loadedCountRef.current = 0;
    setState(INITIAL_STATE);

    function markLoaded() {
      loadedCountRef.current += 1;
      if (loadedCountRef.current >= totalListeners) {
        setState((s) => ({ ...s, loading: false }));
      }
    }

    // ── bus_logs listener (latest 50 entries) ───────────────────────────────
    const logsQuery = query(
      ref(database, "bus_logs"),
      orderByChild("timestamp"),
      limitToLast(50),
    );

    const unsubLogs = onValue(
      logsQuery,
      (snapshot) => {
        const logs: (BusLog & { _key: string })[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            logs.push({ _key: child.key!, ...(child.val() as BusLog) });
            return false;
          });
        }
        setState((s) => ({ ...s, busLogs: logs.reverse() }));
        markLoaded();
      },
      (error) => {
        console.error("[Firebase] bus_logs error:", error);
        setState((s) => ({ ...s, error: error.message }));
        markLoaded();
      },
    );

    // ── emergency_alerts listener ───────────────────────────────────────────
    const alertsQuery = query(
      ref(database, "emergency_alerts"),
      orderByChild("timestamp"),
      limitToLast(20),
    );

    const unsubAlerts = onValue(
      alertsQuery,
      (snapshot) => {
        const alerts: EmergencyAlert[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            alerts.push({ _key: child.key!, ...(child.val() as EmergencyAlert) });
            return false;
          });
        }
        setState((s) => ({ ...s, emergencyAlerts: alerts.reverse() }));
        markLoaded();
      },
      (error) => {
        console.error("[Firebase] emergency_alerts error:", error);
        setState((s) => ({ ...s, error: error.message }));
        markLoaded();
      },
    );

    let unsubGps: (() => void) | undefined;
    let unsubPassengers: (() => void) | undefined;

    if (busId) {
      // ── gps_tracking/{busId} listener ────────────────────────────────────
      const gpsRef = ref(database, `gps_tracking/${busId}`);
      unsubGps = onValue(
        gpsRef,
        (snapshot) => {
          setState((s) => ({
            ...s,
            gpsTracking: snapshot.exists() ? (snapshot.val() as GpsTracking) : null,
          }));
          markLoaded();
        },
        (error) => {
          console.error("[Firebase] gps_tracking error:", error);
          markLoaded();
        },
      );

      // ── passenger_statistics/{busId} listener ────────────────────────────
      const passRef = ref(database, `passenger_statistics/${busId}`);
      unsubPassengers = onValue(
        passRef,
        (snapshot) => {
          setState((s) => ({
            ...s,
            passengerStats: snapshot.exists()
              ? (snapshot.val() as PassengerStatistics)
              : null,
          }));
          markLoaded();
        },
        (error) => {
          console.error("[Firebase] passenger_statistics error:", error);
          markLoaded();
        },
      );
    }

    // Cleanup: remove all listeners on unmount or busId change
    return () => {
      off(logsQuery);
      off(alertsQuery);
      unsubLogs();
      unsubAlerts();
      if (unsubGps) unsubGps();
      if (unsubPassengers) unsubPassengers();
    };
  }, [busId, totalListeners]);

  return state;
}
