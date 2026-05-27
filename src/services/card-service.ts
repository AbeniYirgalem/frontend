import { api } from "@/services/api";

export type Card = {
  _id: string;
  cardUid: string;
  balance: number;
  status: "active" | "blocked" | "lost";
  lastTapAt?: string | null;
};

export type CardTapResult = {
  card: Card;
  trip: unknown;
  transaction: unknown;
};

export async function registerCard(payload: {
  cardUid: string;
  initialBalance?: number;
}) {
  const data = await api<{ data: Card }>("/cards/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function rechargeCard(payload: {
  cardUid: string;
  amount: number;
}) {
  const data = await api<{ data: { card: Card } }>("/cards/recharge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function tapCard(payload: {
  cardUid: string;
  fare: number;
  routeId?: string;
  originStopId?: string;
  destinationStopId?: string;
}) {
  const data = await api<{ data: CardTapResult }>("/cards/tap", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function fetchCard(cardId: string) {
  const data = await api<{ data: Card }>(`/cards/${cardId}`);
  return data.data;
}
