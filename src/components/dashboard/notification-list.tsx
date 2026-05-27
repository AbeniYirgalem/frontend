"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "@/services/notification-service";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  AppNotification["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  success:  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  info:     { icon: Info,         color: "text-blue-400",    bg: "bg-blue-500/10"    },
  warning:  { icon: AlertTriangle,color: "text-amber-400",   bg: "bg-amber-500/10"   },
  critical: { icon: Zap,          color: "text-rose-400",    bg: "bg-rose-500/10"    },
};

export function NotificationList() {
  const [items, setItems]     = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications({ limit: 6 })
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-4 w-4 text-[var(--primary)]" />
          Notifications
        </h3>
        {items.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Bell className="mb-2 h-6 w-6 text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const cfg  = typeConfig[n.type] ?? typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n._id}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3 transition-opacity",
                  n.read ? "opacity-50" : "",
                )}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight">{n.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]/50">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month:  "short",
                      day:    "numeric",
                      hour:   "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
