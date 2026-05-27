"use client";

import { use, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, Wifi, WifiOff, Bus, Clock, MapPin, Gauge,
  Navigation, AlertTriangle, CheckCircle2, Info, Loader2,
  Bell, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveTracking, type BusStatusEvent } from "@/hooks/use-live-tracking";
import { useToast } from "@/hooks/use-toast";

// Leaflet must be dynamically imported (no SSR)
const TripTrackingMap = dynamic(
  () => import("@/components/map/trip-tracking-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/30">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-[var(--muted)]">Loading map…</span>
        </div>
      </div>
    ),
  },
);

// ── Status event icon/color helpers ──────────────────────────────────────────
const eventConfig: Record<
  BusStatusEvent["type"],
  { icon: typeof Bell; color: string; bg: string; borderColor: string }
> = {
  arrival: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  delay: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  fault: {
    icon: AlertTriangle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
  reroute: {
    icon: Navigation,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TrackTripPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const { toast } = useToast();
  const {
    connected,
    snapshot,
    statusEvents,
    loading,
    error,
  } = useLiveTracking(bookingId);

  // ── Toast on new status events ────────────────────────────────────────────
  useEffect(() => {
    if (statusEvents.length === 0) return;
    const latest = statusEvents[0];
    toast({
      title:
        latest.type === "arrival"
          ? "🟢 Bus Arrived"
          : latest.type === "delay"
          ? "⚠️ Trip Update"
          : latest.type === "fault"
          ? "🔴 Alert"
          : "ℹ️ Update",
      description: latest.message,
      variant: latest.type === "fault" ? "destructive" : "default",
    });
  }, [statusEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
          <p className="text-sm text-[var(--muted)]">Loading live tracking…</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
            <p className="text-lg font-semibold">Tracking Unavailable</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {error ?? "Could not load tracking data for this booking."}
            </p>
            <Button asChild className="mt-6">
              <Link href="/my-trips">Back to My Trips</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = Math.round((snapshot.bus.progress ?? 0) * 100);
  const isCompleted = snapshot.status === "completed";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-6 md:py-10">
        <div className="mx-auto max-w-7xl">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="gap-1 px-2">
                <Link href="/my-trips">
                  <ArrowLeft className="h-4 w-4" /> My Trips
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold md:text-2xl">Live Tracking</h1>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {snapshot.from} <ChevronRight className="inline h-3 w-3" /> {snapshot.to}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  connected
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border border-[var(--border)] bg-white/5 text-[var(--muted)]"
                }
              >
                {connected ? (
                  <><Wifi className="mr-1.5 h-3 w-3" /> Live</>
                ) : (
                  <><WifiOff className="mr-1.5 h-3 w-3" /> Reconnecting</>
                )}
              </Badge>
              {isCompleted && (
                <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                </Badge>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">

            {/* ── Map ──────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-[380px] md:h-[520px] overflow-hidden rounded-xl">
                    <TripTrackingMap snapshot={snapshot} className="h-full w-full" />

                    {/* Progress bar overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-[500] bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between mb-1.5 text-xs text-white/80">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#ff6b3d]" />
                          {snapshot.from}
                        </span>
                        <span className="font-semibold">{progress}%</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-purple-400" />
                          {snapshot.to}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/20">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>

                    {/* Map legend */}
                    <div className="absolute top-3 left-3 z-[500] rounded-xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-2.5 text-[10px] space-y-1.5 hidden md:block">
                      <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Your Bus</div>
                      <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Nearby</div>
                      <div className="flex items-center gap-1.5"><span className="h-px w-4 border-t-2 border-dashed border-[#ff6b3d]/60" /> Route</div>
                      <div className="flex items-center gap-1.5"><span className="h-px w-4 border-t-2 border-emerald-500" /> Covered</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              {/* Live bus stats */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                      <Bus className="h-4.5 w-4.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{snapshot.bus.id}</p>
                      <p className="text-[10px] text-[var(--muted)]">Your assigned bus</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: Clock,
                        label: "ETA",
                        value: `${snapshot.etaMinutes} min`,
                        color: "text-amber-400",
                        bg: "bg-amber-500/10",
                      },
                      {
                        icon: Gauge,
                        label: "Speed",
                        value: `${snapshot.bus.speed} km/h`,
                        color: "text-blue-400",
                        bg: "bg-blue-500/10",
                      },
                      {
                        icon: Navigation,
                        label: "Progress",
                        value: `${progress}%`,
                        color: "text-emerald-400",
                        bg: "bg-emerald-500/10",
                      },
                      {
                        icon: Bus,
                        label: "Nearby",
                        value: `${snapshot.nearbyBuses.length} buses`,
                        color: "text-violet-400",
                        bg: "bg-violet-500/10",
                      },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                      <div key={label} className={`rounded-xl ${bg} p-3`}>
                        <Icon className={`h-4 w-4 ${color} mb-1`} />
                        <p className={`text-base font-bold ${color}`}>{value}</p>
                        <p className="text-[10px] text-[var(--muted)]">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Route info */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Route</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6b3d]/15 flex-shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-[#ff6b3d]" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">From</p>
                        <p className="text-sm font-semibold">{snapshot.from}</p>
                      </div>
                    </div>
                    <div className="ml-3.5 h-5 w-px bg-[var(--border)]" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/15 flex-shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">To</p>
                        <p className="text-sm font-semibold">{snapshot.to}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification feed */}
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Notifications
                    </p>
                    {statusEvents.length > 0 && (
                      <Badge className="text-[10px] bg-[var(--primary)]/15 text-[var(--primary)]">
                        {statusEvents.length}
                      </Badge>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {statusEvents.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center py-8 text-center"
                      >
                        <Info className="h-6 w-6 text-[var(--muted)] mb-2" />
                        <p className="text-xs text-[var(--muted)]">
                          No events yet. You&apos;ll be notified of arrivals, delays, and incidents.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {statusEvents.map((evt, i) => {
                          const cfg = eventConfig[evt.type] ?? eventConfig.fault;
                          const Icon = cfg.icon;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className={`rounded-xl border ${cfg.borderColor} ${cfg.bg} p-3 flex items-start gap-2.5`}
                            >
                              <Icon className={`h-4 w-4 ${cfg.color} mt-0.5 flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-semibold ${cfg.color} capitalize`}>
                                  {evt.type}
                                </p>
                                <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                                  {evt.message}
                                </p>
                                <p className="text-[10px] text-[var(--muted)]/60 mt-1">
                                  {new Date(evt.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
