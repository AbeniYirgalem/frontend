/**
 * Firebase data structure TypeScript interfaces — Frontend.
 *
 * Location: frontend/src/types/firebase.ts
 *
 * Mirrors the backend types so the frontend has full type-safety when
 * consuming Firebase Realtime Database data via REST or realtime listeners.
 */

export type EventType =
  | "card_tap"
  | "gps_update"
  | "passenger_count"
  | "emergency"
  | "heartbeat";

/** bus_logs/{pushId} — a single telemetry entry */
export interface BusLog {
  event_type: EventType;
  card_uid?: string;
  passenger_count?: number;
  latitude?: number;
  longitude?: number;
  bus_id?: string;
  route_id?: string;
  timestamp: number;
  created_at?: string;
}

/** emergency_alerts/{pushId} */
export interface EmergencyAlert {
  bus_id: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  acknowledged: boolean;
  acknowledged_at?: string;
  created_at?: string;
  /** Firebase key — injected client-side after reading from DB */
  _key?: string;
}

/** gps_tracking/{bus_id} */
export interface GpsTracking {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  updated_at?: string;
}

/** passenger_statistics/{bus_id} */
export interface PassengerStatistics {
  bus_id: string;
  current_count: number;
  capacity: number;
  occupancy_pct: number;
  peak_count?: number;
  total_boardings?: number;
  timestamp: number;
  updated_at?: string;
}

/** Aggregated realtime state for the ESP32 dashboard */
export interface DashboardState {
  passengerCount: number;
  capacity: number;
  occupancyPct: number;
  gpsLocation: { lat: number; lng: number; speed?: number } | null;
  rfidScans: (BusLog & { _key: string })[];
  emergencyAlerts: EmergencyAlert[];
  lastUpdated: Date | null;
  isConnected: boolean;
}
