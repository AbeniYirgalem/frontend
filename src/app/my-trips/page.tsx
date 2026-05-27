"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Bus,
  Ticket,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Wallet,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/api";

type Trip = {
  _id: string;
  originStop: string;
  destinationStop: string;
  fare: number;
  estimatedDuration: number;
  congestionLevel: string;
  selectedRouteType: string;
  status: string;
  bookedAt: string;
  cancelledAt: string | null;
  refundAmount: number;
  paymentMethod: string;
  routeId?: { from?: string; to?: string } | null;
};

const statusConfig: Record<
  string,
  {
    variant: "success" | "warning" | "danger" | "default";
    icon: typeof CheckCircle2;
    label: string;
  }
> = {
  confirmed: { variant: "success", icon: CheckCircle2, label: "Confirmed" },
  pending: { variant: "warning", icon: Clock, label: "Pending" },
  in_transit: { variant: "default", icon: Bus, label: "In Transit" },
  completed: { variant: "success", icon: CheckCircle2, label: "Completed" },
  cancelled: { variant: "danger", icon: X, label: "Cancelled" },
  refunded: { variant: "warning", icon: RefreshCw, label: "Refunded" },
};

const tabs = ["all", "confirmed", "in_transit", "completed", "cancelled"];

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<Trip | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = tab !== "all" ? `?status=${tab}` : "";
      const res = await api<{ data: { items: Trip[] } }>(
        `/trip-bookings/mine${params}`,
      );
      setTrips(res.data.items);
    } catch {
      setTrips([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchTrips();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api(`/trip-bookings/${cancelTarget._id}/cancel`, {
        method: "PATCH",
      });
      setTrips((prev) =>
        prev.map((t) =>
          t._id === cancelTarget._id
            ? {
                ...t,
                status: "refunded",
                cancelledAt: new Date().toISOString(),
                refundAmount: t.fare,
              }
            : t,
        ),
      );
      setCancelTarget(null);
    } catch {
      /* empty */
    }
    setCancelling(false);
  };

  const canCancel = (status: string) =>
    status === "confirmed" || status === "pending";
  const canTrack = (status: string) =>
    status === "confirmed" || status === "in_transit";

  const getRouteLabel = (trip: Trip) =>
    trip.routeId?.from && trip.routeId?.to
      ? `${trip.routeId.from} → ${trip.routeId.to}`
      : `${trip.originStop} → ${trip.destinationStop}`;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">My Trips</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                View your trip history and track live buses
              </p>
            </div>
            <Button asChild>
              <Link href="/book-trip">
                <Ticket className="mr-2 h-4 w-4" /> Book New Trip
              </Link>
            </Button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-all ${
                  tab === t
                    ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-white/5"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </motion.div>

          {/* Trip List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : trips.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <Ticket className="mb-4 h-10 w-10 text-[var(--muted)]" />
                <p className="text-lg font-semibold">
                  You have not taken any trips yet
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Book a new trip to get started
                </p>
                <Button asChild className="mt-4">
                  <Link href="/book-trip">Book a Trip</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {trips.map((trip, i) => {
                const cfg = statusConfig[trip.status] ?? statusConfig.confirmed;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="transition-all duration-200 hover:scale-[1.005]">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Route + Status */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-bold">
                                {getRouteLabel(trip)}
                              </span>
                              <Badge
                                variant={cfg.variant}
                                className="capitalize text-[10px] gap-1"
                              >
                                <StatusIcon className="h-3 w-3" /> {cfg.label}
                              </Badge>
                              {trip.selectedRouteType === "direct" && (
                                <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">
                                  Direct
                                </Badge>
                              )}
                            </div>

                            {/* Details row */}
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--muted)]">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />{" "}
                                {trip.estimatedDuration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {trip.originStop} → {trip.destinationStop}
                              </span>
                              <span className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" />
                                {trip.paymentMethod === "telebirr"
                                  ? "Telebirr"
                                  : "Card"}
                              </span>
                            </div>

                            {/* Booked / cancelled dates */}
                            <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--muted)]">
                              <span>
                                Booked:{" "}
                                {new Date(trip.bookedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {trip.cancelledAt && (
                                <span className="text-rose-400">
                                  Cancelled:{" "}
                                  {new Date(
                                    trip.cancelledAt,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>

                            {trip.refundAmount > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                                <RefreshCw className="h-3 w-3" /> Refunded:{" "}
                                {trip.refundAmount} ETB
                              </div>
                            )}
                          </div>

                          {/* Right column: fare + actions */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-xl font-bold">
                                {trip.fare}{" "}
                                <span className="text-xs text-[var(--muted)]">
                                  ETB
                                </span>
                              </p>
                            </div>

                            {/* Track Live button */}
                            {canTrack(trip.status) && (
                              <Button
                                asChild
                                size="sm"
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              >
                                <Link href={`/track/${trip._id}`}>
                                  <Navigation className="h-3.5 w-3.5" /> Track
                                  Live
                                </Link>
                              </Button>
                            )}

                            {/* Cancel button */}
                            {canCancel(trip.status) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-rose-400 hover:text-rose-400 hover:bg-rose-500/10"
                                onClick={() => setCancelTarget(trip)}
                              >
                                <X className="h-3.5 w-3.5" /> Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(o) => {
          if (!o) setCancelTarget(null);
        }}
      >
        <DialogContent className="max-w-sm border-[var(--border)] bg-[var(--background)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Cancel Trip
            </DialogTitle>
          </DialogHeader>
          {cancelTarget && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Are you sure you want to cancel{" "}
                <strong>{getRouteLabel(cancelTarget)}</strong>?
              </p>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Refund Amount</span>
                  <span className="font-bold text-emerald-500">
                    {cancelTarget.fare} ETB
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  Full refund for confirmed trips. Refund will be credited to
                  your card balance.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelTarget(null)}
                >
                  Keep Trip
                </Button>
                <Button
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white gap-1"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  {cancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {cancelling ? "Cancelling…" : "Cancel Trip"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
