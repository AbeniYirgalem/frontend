import { api } from "@/services/api";

export type Trip = {
  _id: string;
  fare: number;
  status: "completed" | "failed";
  tappedAt: string;
  routeId?: { from: string; to: string } | null;
};

export type TripResponse = {
  items: Trip[];
  total: number;
  page: number;
  totalPages: number;
};

type TripQuery = {
  page?: number;
  limit?: number;
  status?: string;
};

export async function fetchTrips(query: TripQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const data = await api<{ data: TripResponse }>(`/trips${suffix}`);
  return data.data;
}
