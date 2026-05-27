"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/services/notification-service";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";

const typeConfig: Record<
  AppNotification["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  critical: { icon: Zap, color: "text-rose-400", bg: "bg-rose-500/10" },
};

export function NotificationBell() {
  const { user } = useAuth();
  const socket = useSocket();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnread(count);
    } catch {
      /* silent */
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications({ limit: 12 });
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    if (!user) return;
    void loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [user, loadCount]);

  // Load full list when panel opens
  useEffect(() => {
    if (open) void loadNotifications();
  }, [open, loadNotifications]);

  // Real-time notifications via socket events
  useEffect(() => {
    if (!user) return;

    const pushNotification = (notification?: AppNotification) => {
      if (!notification) return;
      setItems((prev) => [notification, ...prev].slice(0, 12));
      setUnread((prev) => prev + 1);
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    const handleArrival = (payload: { notification?: AppNotification }) => {
      pushNotification(payload.notification);
    };
    const handleFault = (payload: { notification?: AppNotification }) => {
      pushNotification(payload.notification);
    };
    const handleDelay = (payload: { notification?: AppNotification }) => {
      pushNotification(payload.notification);
    };

    socket.on("bus_arrival", handleArrival);
    socket.on("bus_fault", handleFault);
    socket.on("bus_delay", handleDelay);

    return () => {
      socket.off("bus_arrival", handleArrival);
      socket.off("bus_fault", handleFault);
      socket.off("bus_delay", handleDelay);
    };
  }, [socket, toast, user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[var(--muted)] transition-all hover:bg-white/10 hover:text-[var(--foreground)]"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3 w-3" /> All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-[var(--muted)] hover:bg-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Bell className="mb-2 h-6 w-6 text-[var(--muted)]" />
                  <p className="text-xs text-[var(--muted)]">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div>
                  {items.map((n) => {
                    const cfg = typeConfig[n.type] ?? typeConfig.info;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n._id}
                        className={cn(
                          "flex items-start gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors",
                          n.read ? "opacity-60" : "bg-white/[0.02]",
                        )}
                      >
                        <div
                          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold leading-tight">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--muted)]/50">
                            {new Date(n.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            className="mt-1 flex-shrink-0 rounded-md p-1 text-[var(--muted)] hover:bg-white/5 hover:text-emerald-400"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
