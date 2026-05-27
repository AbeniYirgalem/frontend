import { api } from "@/services/api";

export type QueueStatus = {
  station: string;
  queueLength: number;
  level: "low" | "medium" | "high";
  waitMinutes: number;
  updatedAt: string;
};

export type EtaPrediction = {
  routeId: string;
  etaMinutes: number;
  confidence: string;
  updatedAt: string;
};

export async function fetchQueueStatus(station: string) {
  const params = new URLSearchParams({ station });
  const data = await api<{ data: QueueStatus }>(`/metrics/queue?${params}`);
  return data.data;
}

export async function fetchEta(routeId: string) {
  const params = new URLSearchParams({ routeId });
  const data = await api<{ data: EtaPrediction }>(`/metrics/eta?${params}`);
  return data.data;
}
