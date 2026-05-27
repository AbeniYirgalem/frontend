"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, History, Route, Ticket, Clock, MapPin, CheckCircle2, X, RefreshCw, Loader2, ArrowRight, Wallet } from "lucide-react";
import { useWallet } from "@/providers/wallet-provider";
import { AnimatedBalance } from "@/components/rfid/animated-balance";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchTrips, type Trip } from "@/services/trip-service";
import {
  fetchTransactions,
  type Transaction,
} from "@/services/transaction-service";
import {
  type AdminOverview,
  type RouteSuggestion,
  fetchAdminOverview,
  fetchRouteSuggestions,
} from "@/services/intelligence-service";
import { api } from "@/services/api";

type TripBooking = {
  _id: string; originStop: string; destinationStop: string;
  fare: number; estimatedDuration: number; congestionLevel: string;
  selectedRouteType: string; status: string; bookedAt: string;
  cancelledAt: string | null; refundAmount: number; paymentMethod: string;
  routeId?: { from?: string; to?: string } | null;
};

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "warning", label: "Pending" },
  in_transit: { variant: "default", label: "In Transit" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "danger", label: "Cancelled" },
  refunded: { variant: "warning", label: "Refunded" },
};

function money(value: number) {
  return new Intl.NumberFormat("en-ET", {
    maximumFractionDigits: 0,
  }).format(value) + " ETB";
}

export default function PassengerDashboardPage() {
  const { wallet } = useWallet();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [routes, setRoutes] = useState<RouteSuggestion[]>([]);
  const [bookedTrips, setBookedTrips] = useState<TripBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");

  // Derived from wallet provider (auto-synced)
  const rfidBalance = wallet?.balance ?? null;
  const rfidCardUid = wallet?.cardUid ?? "";
  const rfidStatus = wallet?.status ?? "active";
  const rfidLastTap = wallet?.lastTapAt ?? null;

  useEffect(() => {
    let active = true;

    async function loadPassengerData() {
      try {
        const [overviewData, tripData, transactionData, routeData] =
          await Promise.all([
            fetchAdminOverview(),
            fetchTrips({ limit: 6 }),
            fetchTransactions({ limit: 6 }),
            fetchRouteSuggestions("Megenagna", "CMC"),
          ]);

        if (!active) return;
        setOverview(overviewData);
        setTrips(tripData.items);
        setTransactions(transactionData.items);
        setRoutes(routeData);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load passenger dashboard",
          );
        }
      }
    }

    async function loadBookedTrips() {
      try {
        const res = await api<{ data: { items: TripBooking[] } }>("/trip-bookings/mine?limit=5");
        if (active) setBookedTrips(res.data.items);
      } catch { /* empty */ }
      if (active) setLoadingBookings(false);
    }

    loadPassengerData();
    loadBookedTrips();
    const timer = window.setInterval(loadPassengerData, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const rechargeTotal = transactions
    .filter((transaction) => transaction.type === "recharge")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const activeBookings = bookedTrips.filter((t) => t.status === "confirmed" || t.status === "pending" || t.status === "in_transit");
  const completedBookings = bookedTrips.filter((t) => t.status === "completed");

  const getRouteLabel = (t: TripBooking) =>
    t.routeId?.from && t.routeId?.to
      ? `${t.routeId.from} → ${t.routeId.to}`
      : `${t.originStop} → ${t.destinationStop}`;

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-rose-500/40 text-sm text-rose-200">{error}</Card>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          label="Total Trips"
          value={String(trips.length + bookedTrips.length)}
          trend={`${activeBookings.length} active now`}
        />
        <StatsCard
          label="Booked Trips"
          value={String(bookedTrips.length)}
          trend={`${completedBookings.length} completed`}
        />
        <StatsCard
          label="Recharge Activity"
          value={money(rechargeTotal)}
          trend={`${transactions.length} transactions`}
        />
        <StatsCard
          label="Next Bus ETA"
          value={`${overview?.eta.etaMinutes ?? "--"}m`}
          trend={`${overview?.availability.level ?? "medium"} availability`}
        />
      </div>

      {/* ── RFID Wallet Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 text-white shadow-2xl shadow-cyan-500/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium opacity-80">RFID Transit Card</span>
            </div>
            <Badge className={`border-0 text-[10px] ${rfidStatus === "active" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-200"}`}>
              {rfidStatus}
            </Badge>
          </div>
          <p className="mb-1 font-mono text-lg tracking-widest opacity-80">{rfidCardUid || "Loading..."}</p>
          <p className="text-3xl font-bold">{rfidBalance !== null ? <AnimatedBalance value={rfidBalance} className="text-white" /> : "--"}</p>
          {rfidLastTap && (
            <p className="mt-1 text-xs opacity-60">Last used: {new Date(rfidLastTap).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" asChild className="bg-white/20 text-white hover:bg-white/30 border-0 gap-1">
              <Link href="/rfid-wallet"><Wallet className="h-3.5 w-3.5" /> Recharge</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10 gap-1">
              <Link href="/rfid-wallet"><History className="h-3.5 w-3.5" /> History</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Booked Trips Section ── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold">My Booked Trips</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-trips" className="gap-1 text-xs">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/book-trip" className="gap-1">
                <Ticket className="h-3.5 w-3.5" /> Book Trip
              </Link>
            </Button>
          </div>
        </div>

        {loadingBookings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
          </div>
        ) : bookedTrips.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Ticket className="mb-2 h-8 w-8 text-[var(--muted)]" />
            <p className="text-sm text-muted">No booked trips yet.</p>
            <Button size="sm" asChild className="mt-3">
              <Link href="/book-trip">Book Your First Trip</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2">Route</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Fare</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {bookedTrips.map((booking) => {
                  const cfg = statusConfig[booking.status] || statusConfig.confirmed;
                  return (
                    <tr key={booking._id} className="border-t border-white/10">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                          <span className="font-medium">{getRouteLabel(booking)}</span>
                          {booking.selectedRouteType === "direct" && (
                            <Badge className="bg-emerald-500/15 text-emerald-500 text-[9px]">Direct</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3 text-[var(--muted)]" /> {booking.estimatedDuration} min
                        </span>
                      </td>
                      <td className="py-3 font-medium">{booking.fare} ETB</td>
                      <td className="py-3">
                        <Badge variant={cfg.variant} className="capitalize text-[10px]">{cfg.label}</Badge>
                        {booking.refundAmount > 0 && (
                          <span className="ml-1 text-[10px] text-emerald-500">+{booking.refundAmount} ETB</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted">
                        {new Date(booking.bookedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Trip History + Suggested Routes */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold">Trip History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Route</th>
                  <th className="py-2">Fare</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip._id} className="border-t border-white/10">
                    <td className="py-3">{new Date(trip.tappedAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      {trip.routeId ? `${trip.routeId.from} → ${trip.routeId.to}` : "RFID tap"}
                    </td>
                    <td className="py-3">{money(trip.fare)}</td>
                    <td className="py-3">
                      <Badge variant={trip.status === "completed" ? "success" : "danger"}>
                        {trip.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {trips.length === 0 ? <p className="text-sm text-muted">No trips found yet.</p> : null}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-lg font-semibold">Suggested Routes</h3>
          </div>
          {routes.map((route) => (
            <div key={route.id} className="rounded-2xl border border-white/10 p-3">
              <p className="text-sm font-semibold">{route.path.join(" → ")}</p>
              <p className="mt-1 text-xs text-muted">
                {route.estimatedMinutes} min · {route.reason}
              </p>
            </div>
          ))}
        </Card>
      </div>

      {/* Transactions */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold">Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Balance after</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="border-t border-white/10">
                  <td className="py-3">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 capitalize">{transaction.type}</td>
                  <td className="py-3">{money(transaction.amount)}</td>
                  <td className="py-3">{money(transaction.balanceAfter)}</td>
                  <td className="py-3">
                    <Badge variant={transaction.status === "success" ? "success" : "danger"}>
                      {transaction.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted">Recharge and fare activity will appear here.</p>
        ) : null}
      </Card>
    </div>
  );
}
