"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, ChevronLeft, ChevronRight, Clock, MapPin,
  Ticket, Loader2, Navigation, CheckCircle2, X, RefreshCw, Bus,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

type TripBooking = {
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

const STATUS_TABS = ["all", "confirmed", "in_transit", "completed", "cancelled", "refunded"];

const statusConfig: Record<
  string,
  { variant: "success" | "warning" | "danger" | "default"; icon: typeof CheckCircle2; label: string }
> = {
  confirmed:  { variant: "success", icon: CheckCircle2, label: "Confirmed" },
  pending:    { variant: "warning", icon: Clock,        label: "Pending"   },
  in_transit: { variant: "default", icon: Bus,          label: "In Transit"},
  completed:  { variant: "success", icon: CheckCircle2, label: "Completed" },
  cancelled:  { variant: "danger",  icon: X,            label: "Cancelled" },
  refunded:   { variant: "warning", icon: RefreshCw,    label: "Refunded"  },
};

const PAGE_SIZE = 8;

export default function TripHistoryPage() {
  const [trips, setTrips]       = useState<TripBooking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setFilter] = useState("all");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await api<{
        data: { items: TripBooking[]; total: number; totalPages: number };
      }>(`/trip-bookings/mine?${params.toString()}`);

      setTrips(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setTrips([]);
      setTotal(0);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { void fetchTrips(); }, [fetchTrips]);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  // Client-side search filter (on current page results)
  const filtered = trips.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.originStop.toLowerCase().includes(q) ||
      t.destinationStop.toLowerCase().includes(q) ||
      t._id.toLowerCase().includes(q) ||
      (t.routeId?.from?.toLowerCase().includes(q) ?? false) ||
      (t.routeId?.to?.toLowerCase().includes(q) ?? false)
    );
  });

  const getRouteLabel = (t: TripBooking) =>
    t.routeId?.from && t.routeId?.to
      ? `${t.routeId.from} → ${t.routeId.to}`
      : `${t.originStop} → ${t.destinationStop}`;

  const canTrack = (s: string) => s === "confirmed" || s === "in_transit";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Trip History</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                All trips are your real, user-triggered bookings stored in MongoDB
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!loading && (
                <Badge className="bg-white/5 text-[var(--muted)]">
                  <Clock className="mr-1.5 h-3 w-3" />
                  {total} Total
                </Badge>
              )}
              <Button asChild size="sm">
                <Link href="/book-trip">
                  <Ticket className="mr-1.5 h-4 w-4" /> Book Trip
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="mb-6">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <Input
                    placeholder="Search by stop, route, or booking ID…"
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* Status tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Filter className="h-4 w-4 text-[var(--muted)]" />
                  {STATUS_TABS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                        statusFilter === f
                          ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                          : "text-[var(--muted)] hover:bg-white/5"
                      }`}
                    >
                      {f.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                  <p className="text-sm text-[var(--muted)]">Loading your trips…</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              /* ── Empty state — no fake data ── */
              <Card>
                <CardContent className="flex flex-col items-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
                    <Ticket className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-xl font-bold">
                    {search ? "No trips match your search" : "No trips yet"}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                    {search
                      ? "Try a different search term or clear the filter."
                      : "Your trip history will appear here after your first booking. Every trip you take is automatically saved to the database."}
                  </p>
                  {!search && (
                    <Button asChild className="mt-6">
                      <Link href="/book-trip">Book Your First Trip</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop table */}
                <Card className="hidden md:block">
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                          <th className="px-5 py-4 font-medium">Booking ID</th>
                          <th className="px-5 py-4 font-medium">Route</th>
                          <th className="px-5 py-4 font-medium">Duration</th>
                          <th className="px-5 py-4 font-medium">Fare</th>
                          <th className="px-5 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 font-medium">Booked At</th>
                          <th className="px-5 py-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((t) => {
                          const cfg = statusConfig[t.status] ?? statusConfig.confirmed;
                          const Icon = cfg.icon;
                          return (
                            <tr
                              key={t._id}
                              className="border-b border-[var(--border)] transition-colors hover:bg-white/[0.02]"
                            >
                              <td className="px-5 py-4 font-mono text-xs font-semibold text-[var(--muted)]">
                                {t._id.slice(-8).toUpperCase()}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[var(--primary)]" />
                                  <span className="font-medium">{getRouteLabel(t)}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-[var(--muted)]">
                                {t.estimatedDuration} min
                              </td>
                              <td className="px-5 py-4 font-semibold">
                                {t.fare} ETB
                                {t.refundAmount > 0 && (
                                  <span className="ml-1.5 text-[10px] text-emerald-500">
                                    +{t.refundAmount} refund
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <Badge
                                  variant={cfg.variant}
                                  className="capitalize gap-1 text-[10px]"
                                >
                                  <Icon className="h-3 w-3" /> {cfg.label}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-xs text-[var(--muted)]">
                                {new Date(t.bookedAt).toLocaleDateString("en-US", {
                                  month:  "short",
                                  day:    "numeric",
                                  year:   "numeric",
                                  hour:   "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-5 py-4">
                                {canTrack(t.status) && (
                                  <Button
                                    asChild
                                    size="sm"
                                    className="h-7 gap-1 bg-emerald-600 px-2.5 text-[11px] text-white hover:bg-emerald-700"
                                  >
                                    <Link href={`/track/${t._id}`}>
                                      <Navigation className="h-3 w-3" /> Track
                                    </Link>
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Mobile cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filtered.map((t) => {
                    const cfg = statusConfig[t.status] ?? statusConfig.confirmed;
                    const Icon = cfg.icon;
                    return (
                      <Card key={t._id}>
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-[var(--muted)]">
                              {t._id.slice(-8).toUpperCase()}
                            </span>
                            <Badge variant={cfg.variant} className="capitalize text-[10px] gap-1">
                              <Icon className="h-3 w-3" /> {cfg.label}
                            </Badge>
                          </div>
                          <p className="mb-1 text-sm font-medium">{getRouteLabel(t)}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                            <span>{t.estimatedDuration} min</span>
                            <span>{t.fare} ETB</span>
                            <span>{t.paymentMethod === "telebirr" ? "Telebirr" : "Card"}</span>
                          </div>
                          {canTrack(t.status) && (
                            <Button
                              asChild
                              size="sm"
                              className="mt-3 h-7 w-full gap-1 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700"
                            >
                              <Link href={`/track/${t._id}`}>
                                <Navigation className="h-3 w-3" /> Track Live
                              </Link>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                    p === page
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted)] hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
