/**
 * Firebase API service — Frontend.
 *
 * Location: frontend/src/services/firebase-service.ts
 *
 * Calls the backend REST endpoints (which then read/write Firebase) using the
 * existing api() utility. This keeps Firebase credentials on the server only.
 *
 * For real-time updates, use the use-firebase-telemetry hook instead, which
 * subscribes directly to Firebase via the client SDK.
 */

import { api } from "@/services/api";
import type {
  BusLog,
  EmergencyAlert,
  GpsTracking,
  PassengerStatistics,
} from "@/types/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TelemetryListResponse {
  records: BusLog[];
  count: number;
}

interface BusStatusResponse {
  gps: GpsTracking | null;
  passengers: PassengerStatistics | null;
}

interface AlertListResponse {
  alerts: EmergencyAlert[];
  count: number;
}

// ─── Write (ESP32 data ingestion) ─────────────────────────────────────────────

/**
 * Save a raw telemetry event to Firebase via the backend.
 */
export async function saveTelemetry(payload: {
  event_type: string;
  card_uid?: string;
  passenger_count?: number;
  latitude?: number;
  longitude?: number;
  bus_id?: string;
  route_id?: string;
  timestamp?: number;
}): Promise<{ key: string }> {
  const res = await api<ApiResponse<{ key: string }>>("/firebase/telemetry", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Save an RFID card tap event.
 */
export async function saveRfidTap(payload: {
  card_uid: string;
  bus_id?: string;
  route_id?: string;
  passenger_count?: number;
  latitude?: number;
  longitude?: number;
  timestamp?: number;
}): Promise<{ key: string }> {
  const res = await api<ApiResponse<{ key: string }>>("/firebase/rfid-tap", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Save GPS coordinates for a bus.
 */
export async function saveGps(payload: {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
}): Promise<void> {
  await api<ApiResponse<{ bus_id: string }>>("/firebase/gps", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Save passenger count for a bus.
 */
export async function savePassengerCount(payload: {
  bus_id: string;
  current_count: number;
  capacity: number;
  peak_count?: number;
  total_boardings?: number;
  timestamp?: number;
}): Promise<void> {
  await api<ApiResponse<{ bus_id: string }>>("/firebase/passenger-count", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Save an emergency alert.
 */
export async function saveEmergencyAlert(payload: {
  bus_id: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  latitude?: number;
  longitude?: number;
  timestamp?: number;
}): Promise<{ key: string }> {
  const res = await api<ApiResponse<{ key: string; bus_id: string; severity: string }>>(
    "/firebase/emergency",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return { key: res.data.key };
}

// ─── Read (Dashboard queries) ─────────────────────────────────────────────────

/**
 * Fetch all recent telemetry records from Firebase.
 */
export async function fetchAllTelemetry(limit = 200): Promise<BusLog[]> {
  const res = await api<ApiResponse<TelemetryListResponse>>(
    `/firebase/telemetry?limit=${limit}`,
  );
  return res.data.records;
}

/**
 * Fetch the latest GPS + passenger status snapshot for a bus.
 */
export async function fetchBusStatus(busId: string): Promise<BusStatusResponse> {
  const res = await api<ApiResponse<BusStatusResponse>>(
    `/firebase/bus/${encodeURIComponent(busId)}/status`,
  );
  return res.data;
}

/**
 * Fetch emergency alerts. Pass onlyUnacknowledged=true to get only active ones.
 */
export async function fetchEmergencyAlerts(
  onlyUnacknowledged = false,
): Promise<EmergencyAlert[]> {
  const qs = onlyUnacknowledged ? "?unacknowledged=true" : "";
  const res = await api<ApiResponse<AlertListResponse>>(`/firebase/emergency${qs}`);
  return res.data.alerts;
}

/**
 * Fetch passenger statistics for a specific bus.
 */
export async function fetchPassengerStats(
  busId: string,
): Promise<PassengerStatistics | null> {
  try {
    const res = await api<ApiResponse<PassengerStatistics>>(
      `/firebase/bus/${encodeURIComponent(busId)}/passengers`,
    );
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Acknowledge an emergency alert by its Firebase key.
 */
export async function acknowledgeAlert(alertKey: string): Promise<void> {
  await api<ApiResponse<{ alertKey: string }>>(
    `/firebase/emergency/${encodeURIComponent(alertKey)}/acknowledge`,
    { method: "PATCH" },
  );
}
