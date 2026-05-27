import { api } from "@/services/api";
import type { BackendSchedule } from "@/types/api";

export async function searchSchedules(params: {
  from: string;
  to: string;
  date: string;
}) {
  const query = new URLSearchParams(params).toString();
  const data = await api<{ data: BackendSchedule[] }>(
    `/schedules/search?${query}`,
  );
  return data.data;
}
