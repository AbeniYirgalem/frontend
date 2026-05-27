import { api } from "@/services/api";

export type Level = "low" | "medium" | "high";
export type CongestionLevel = Level | "critical";

export type QueueStatus = {
  station: string;
  queueLength: number;
  density: number;
  level: Level;
  waitMinutes: number;
  updatedAt: string;
};

export type EtaPrediction = {
  routeId: string;
  etaMinutes: number;
  confidence: "low" | "medium" | "high";
  basis: string;
  updatedAt: string;
};

export type Availability = {
  station: string;
  activeVehicles: number;
  availableSeats: number;
  level: Level;
  queueLength: number;
  updatedAt: string;
};

export type CongestionPoint = {
  stationName: string;
  latitude: number;
  longitude: number;
  density: number;
  queueLength: number;
  waitMinutes: number;
  level: CongestionLevel;
  sampledAt: string;
};

export type VehicleLocation = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  availability: Level;
  lastGpsAt: string;
};

export type Fault = {
  _id: string;
  title: string;
  category: string;
  severity: CongestionLevel;
  status: string;
  stationName?: string;
  vehicleId?: string;
  description: string;
  detectedAt: string;
};

export type RouteSuggestion = {
  id: string;
  path: string[];
  type: "direct" | "alternative";
  distanceKm: number;
  estimatedMinutes: number;
  reason: string;
};

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "success";
  audience: string;
  createdAt: string;
};

export type AdminOverview = {
  kpis: {
    activePassengers: number;
    activeCards: number;
    liveFaults: number;
    tripsToday: number;
  };
  queue: QueueStatus;
  eta: EtaPrediction;
  availability: Availability;
  transactions: Array<{ _id: string; total: number; count: number }>;
};

export async function fetchAdminOverview() {
  const response = await api<{ data: AdminOverview }>("/intelligence/overview");
  return response.data;
}

export async function fetchCongestion() {
  const response = await api<{ data: CongestionPoint[] }>(
    "/intelligence/congestion",
  );
  return response.data;
}

export async function fetchVehicleLocations() {
  const response = await api<{ data: VehicleLocation[] }>(
    "/intelligence/vehicles",
  );
  return response.data;
}

export async function fetchFaults() {
  const response = await api<{
    data: { items: Fault[]; total: number; page: number; totalPages: number };
  }>("/intelligence/faults?limit=8");
  return response.data;
}

export async function fetchRouteSuggestions(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const response = await api<{ data: RouteSuggestion[] }>(
    `/intelligence/routes?${params}`,
  );
  return response.data;
}

export async function fetchNotifications(audience = "all") {
  const params = new URLSearchParams({ audience });
  const response = await api<{ data: Notification[] }>(
    `/intelligence/notifications?${params}`,
  );
  return response.data;
}

export async function fetchSolutions() {
  const response = await api<{
    data: Array<{
      faultId: string;
      title: string;
      severity: CongestionLevel;
      action: string;
    }>;
  }>("/intelligence/solutions");
  return response.data;
}

export async function fetchPassengerFlow() {
  const response = await api<{
    data: {
      tripsByRoute: Array<{ _id: string | null; passengers: number; revenue: number }>;
      peakHours: Array<{ _id: number; passengers: number }>;
      busiestStations: Array<{ _id: string | null; passengers: number }>;
    };
  }>("/intelligence/passenger-flow");
  return response.data;
}
