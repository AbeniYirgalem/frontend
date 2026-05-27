import { api } from "@/services/api";
import type { BackendBus } from "@/types/api";

export async function fetchBuses(): Promise<BackendBus[]> {
  const data = await api<{ data: BackendBus[] }>("/buses");
  return data.data;
}

export async function fetchBusById(id: string): Promise<BackendBus | null> {
  const data = await api<{ data: BackendBus | null }>(`/buses/${id}`);
  return data.data;
}
