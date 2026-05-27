import { api } from "@/services/api";

export type AppNotification = {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "success";
  audience: "passenger" | "operator" | "admin" | "all";
  read: boolean;
  createdAt: string;
};

export type NotificationList = {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
};

/** GET /api/notifications */
export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  unread?: boolean;
}): Promise<NotificationList> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.unread) qs.set("unread", "true");
  const query = qs.toString() ? `?${qs.toString()}` : "";
  const res = await api<{ data: NotificationList }>(`/notifications${query}`);
  return res.data;
}

/** GET /api/notifications/unread-count */
export async function fetchUnreadCount(): Promise<number> {
  const res = await api<{ data: { count: number } }>("/notifications/unread-count");
  return res.data.count;
}

/** PATCH /api/notifications/:id/read */
export async function markNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${id}/read`, { method: "PATCH" });
}

/** PATCH /api/notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await api("/notifications/read-all", { method: "PATCH" });
}
