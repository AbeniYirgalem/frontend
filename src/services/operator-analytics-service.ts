import { api } from "@/services/api";

export type OperatorOverview = {
  activeUsers: number;
  totalRevenue: number;
  activeWindowMinutes: number;
};

export async function fetchOperatorOverview() {
  const data = await api<{ data: OperatorOverview }>("/operators/overview");
  return data.data;
}
