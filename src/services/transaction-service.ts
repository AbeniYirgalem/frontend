import { api } from "@/services/api";

export type Transaction = {
  _id: string;
  type: "recharge" | "fare";
  amount: number;
  status: "success" | "failed";
  balanceAfter: number;
  createdAt: string;
};

export type TransactionResponse = {
  items: Transaction[];
  total: number;
  page: number;
  totalPages: number;
};

type TransactionQuery = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
};

export async function fetchTransactions(query: TransactionQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.type) params.set("type", query.type);
  if (query.status) params.set("status", query.status);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const data = await api<{ data: TransactionResponse }>(
    `/transactions${suffix}`,
  );
  return data.data;
}
