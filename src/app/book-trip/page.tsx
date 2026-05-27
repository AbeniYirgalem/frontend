"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Search,
  Clock,
  Bus,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  TrendingUp,
  Shield,
  Navigation,
  Ticket,
  Wallet,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { STATIONS } from "@/constants/addis-ababa-routes";
import { useWallet } from "@/providers/wallet-provider";
import { AnimatedBalance } from "@/components/rfid/animated-balance";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

type RouteOption = {
  id: string;
  from: string;
  to: string;
  label: string;
  distance: number;
  fare: number;
  durationMinutes: number;
  congestionScore: number;
  congestionLevel: string;
  availableBuses: number;
  waitTimeMinutes: number;
  routeType: string;
  transferStops: string[];
};

type SortKey = "fastest" | "cheapest" | "leastCongested";

const stationNames = Object.values(STATIONS)
  .map((s) => s.name)
  .sort();

const congestionColors: Record<string, string> = {
  low: "text-emerald-500 bg-emerald-500/15",
  medium: "text-amber-500 bg-amber-500/15",
  high: "text-orange-500 bg-orange-500/15",
  critical: "text-rose-500 bg-rose-500/15",
};

const congestionBarWidth: Record<string, string> = {
  low: "w-1/4",
  medium: "w-1/2",
  high: "w-3/4",
  critical: "w-full",
};

const congestionBarColor: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-rose-500",
};

export default function BookTripPage() {
  const router = useRouter();
  const { wallet, deductFare } = useWallet();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("fastest");
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  // Derived from wallet provider
  const rfidBalance = wallet?.balance ?? null;
  const rfidCardUid = wallet?.cardUid ?? "";

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const findRoutes = async () => {
    if (!origin || !destination || origin === destination) return;
    setLoading(true);
    setRouteError(null);
    try {
      // Use api() helper — calls Express backend directly with JWT auth
      const res = await api<{ data: RouteOption[] }>(
        `/routing/options?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`,
      );
      const nextRoutes = res.data ?? [];
      setRoutes(nextRoutes);
      setStep(2);
      if (nextRoutes.length === 0) {
        setRouteError("No routes available");
      }
    } catch (err) {
      setRoutes([]);
      setStep(2);
      setRouteError("Failed to load routes");
      toast({
        title: "Failed to load routes",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const sortedRoutes = useMemo(() => {
    const copy = [...routes];
    if (sortBy === "fastest")
      copy.sort((a, b) => a.durationMinutes - b.durationMinutes);
    else if (sortBy === "cheapest") copy.sort((a, b) => a.fare - b.fare);
    else copy.sort((a, b) => a.congestionScore - b.congestionScore);
    return copy;
  }, [routes, sortBy]);

  const confirmBooking = async () => {
    if (!selectedRoute) return;
    setBalanceError("");

    // Check RFID balance before booking
    if (rfidBalance !== null && rfidBalance < selectedRoute.fare) {
      setBalanceError(
        `Insufficient RFID balance. Current: ${rfidBalance} ETB, Required: ${selectedRoute.fare} ETB. Please recharge using Telebirr.`,
      );
      toast({
        title: "Insufficient RFID balance",
        description: "Please recharge your RFID card.",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      const res = await api<{ data: { _id: string } }>("/trip-bookings", {
        method: "POST",
        body: JSON.stringify({
          routeId: selectedRoute.id, // Real ObjectId from routing API
          originStop: origin,
          destinationStop: destination,
          fare: selectedRoute.fare,
          estimatedDuration: selectedRoute.durationMinutes,
          congestionLevel: selectedRoute.congestionLevel,
          selectedRouteType: selectedRoute.routeType,
        }),
      });

      const bookingId = res.data._id;

      // Optimistic wallet deduction (UI stays in sync)
      await deductFare(selectedRoute.fare);

      toast({
        title: "🎉 Trip booked!",
        description: `${selectedRoute.fare} ETB deducted. Redirecting to live tracking…`,
      });

      setConfirmOpen(false);
      setBookingDone(true);

      // Redirect to live tracking for this specific booking
      setTimeout(() => router.push(`/track/${bookingId}`), 1200);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Booking failed. Please try again.";
      toast({
        title: "Booking failed",
        description: msg,
        variant: "destructive",
      });
    }
    setBooking(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold md:text-3xl">Book a Trip</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Choose your route across Addis Ababa and book your ride
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center gap-2"
          >
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= s ? "bg-[var(--primary)] text-white" : "bg-white/10 text-[var(--muted)]"}`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${step >= s ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}
                >
                  {s === 1
                    ? "Select Stops"
                    : s === 2
                      ? "Choose Route"
                      : "Confirm"}
                </span>
                {s < 3 && (
                  <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                )}
              </div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Origin & Destination ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[var(--primary)]" />
                      <h2 className="text-lg font-semibold">
                        Where are you going?
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {/* Origin */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
                          Origin Station
                        </label>
                        <select
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        >
                          <option value="">Select departure station...</option>
                          {stationNames.map((n) => (
                            <option
                              key={n}
                              value={n}
                              disabled={n === destination}
                            >
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Swap */}
                      <div className="flex justify-center">
                        <button
                          onClick={swap}
                          disabled={!origin && !destination}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] disabled:opacity-30"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Destination */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">
                          Destination Station
                        </label>
                        <select
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        >
                          <option value="">Select arrival station...</option>
                          {stationNames.map((n) => (
                            <option key={n} value={n} disabled={n === origin}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        size="lg"
                        className="mt-4 w-full gap-2"
                        disabled={
                          !origin ||
                          !destination ||
                          origin === destination ||
                          loading
                        }
                        onClick={findRoutes}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        {loading ? "Finding routes..." : "Find Routes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Step 2: Choose Route ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Back + Summary */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    ← Change stops
                  </button>
                  <Badge className="bg-white/5 text-[var(--foreground)]">
                    <MapPin className="mr-1 h-3 w-3 text-[var(--primary)]" />
                    {origin} → {destination}
                  </Badge>
                </div>

                {/* Sort */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">Sort:</span>
                  {(
                    [
                      ["fastest", "Fastest", Zap],
                      ["cheapest", "Cheapest", TrendingUp],
                      ["leastCongested", "Least Busy", Shield],
                    ] as const
                  ).map(([key, label, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${sortBy === key ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "text-[var(--muted)] hover:bg-white/5"}`}
                    >
                      <Icon className="h-3 w-3" /> {label}
                    </button>
                  ))}
                </div>

                {routeError && (
                  <Card className="border-[var(--border)] bg-white/5">
                    <CardContent className="p-4 text-sm text-[var(--muted)]">
                      {routeError}
                    </CardContent>
                  </Card>
                )}

                {/* Route Cards */}
                <div className="space-y-3">
                  {sortedRoutes.map((route, i) => {
                    const isFastest = i === 0 && sortBy === "fastest";
                    const isCheapest =
                      route.fare ===
                      Math.min(...sortedRoutes.map((r) => r.fare));
                    return (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all duration-200 hover:scale-[1.01] ${selectedRoute?.id === route.id ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]" : ""}`}
                          onClick={() => setSelectedRoute(route)}
                        >
                          <CardContent className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-bold">
                                    {route.label}
                                  </span>
                                  <div className="flex gap-1">
                                    {route.routeType === "direct" && (
                                      <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">
                                        Direct
                                      </Badge>
                                    )}
                                    {route.transferStops.length > 0 && (
                                      <Badge className="bg-blue-500/15 text-blue-400 text-[10px]">
                                        {route.transferStops.length} Transfer
                                      </Badge>
                                    )}
                                    {isFastest && (
                                      <Badge className="bg-violet-500/15 text-violet-400 text-[10px]">
                                        <Zap className="mr-0.5 h-2.5 w-2.5" />
                                        Fastest
                                      </Badge>
                                    )}
                                    {isCheapest && (
                                      <Badge className="bg-amber-500/15 text-amber-400 text-[10px]">
                                        Cheapest
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />{" "}
                                    {route.durationMinutes} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Bus className="h-3 w-3" />{" "}
                                    {route.availableBuses} buses
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Navigation className="h-3 w-3" />{" "}
                                    {route.distance} km
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Wait:{" "}
                                    {route.waitTimeMinutes} min
                                  </span>
                                </div>

                                {/* Congestion bar */}
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-[10px] text-[var(--muted)]">
                                    Congestion:
                                  </span>
                                  <div className="h-1.5 flex-1 max-w-[120px] rounded-full bg-white/10">
                                    <div
                                      className={`h-full rounded-full transition-all ${congestionBarWidth[route.congestionLevel]} ${congestionBarColor[route.congestionLevel]}`}
                                    />
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${congestionColors[route.congestionLevel]}`}
                                  >
                                    {route.congestionLevel}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {route.fare}
                                </p>
                                <p className="text-[10px] text-[var(--muted)]">
                                  ETB
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className="mt-6 w-full gap-2"
                  disabled={!selectedRoute}
                  onClick={() => {
                    setConfirmOpen(true);
                    setStep(3);
                  }}
                >
                  <Ticket className="h-4 w-4" /> Continue to Booking
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Confirm Modal ── */}
          <Dialog
            open={confirmOpen && step === 3}
            onOpenChange={(o) => {
              if (!o) {
                setConfirmOpen(false);
                setStep(2);
              }
            }}
          >
            <DialogContent className="max-w-md border-[var(--border)] bg-[var(--background)] p-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {bookingDone ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                    <h3 className="mb-1 text-xl font-bold">Trip Booked!</h3>
                    <p className="mb-6 text-sm text-[var(--muted)]">
                      {selectedRoute?.label} · {selectedRoute?.fare} ETB
                    </p>
                    <div className="flex w-full gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/my-trips")}
                      >
                        View My Trips
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setBookingDone(false);
                          setConfirmOpen(false);
                          setStep(1);
                          setSelectedRoute(null);
                          setRoutes([]);
                        }}
                      >
                        Book Another
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="border-b border-[var(--border)] px-6 py-4">
                      <h3 className="text-lg font-semibold">Confirm Booking</h3>
                    </div>
                    {selectedRoute && (
                      <div className="p-6 space-y-4">
                        {/* RFID Wallet Balance */}
                        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[var(--muted)]">
                              {rfidCardUid || "RFID Wallet"}
                            </p>
                            <p className="text-lg font-bold">
                              {rfidBalance !== null
                                ? `${rfidBalance.toLocaleString()} ETB`
                                : "Loading..."}
                            </p>
                          </div>
                          {rfidBalance !== null &&
                            rfidBalance < selectedRoute.fare && (
                              <Badge variant="danger" className="text-[10px]">
                                Low
                              </Badge>
                            )}
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted)]">Route</span>
                            <span className="font-semibold">
                              {selectedRoute.label}
                            </span>
                          </div>
                          <div className="h-px bg-[var(--border)]" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted)]">
                              Duration
                            </span>
                            <span>{selectedRoute.durationMinutes} min</span>
                          </div>
                          <div className="h-px bg-[var(--border)]" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted)]">
                              Wait Time
                            </span>
                            <span>{selectedRoute.waitTimeMinutes} min</span>
                          </div>
                          <div className="h-px bg-[var(--border)]" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted)]">
                              Congestion
                            </span>
                            <span
                              className={`capitalize rounded-full px-2 py-0.5 text-xs ${congestionColors[selectedRoute.congestionLevel]}`}
                            >
                              {selectedRoute.congestionLevel}
                            </span>
                          </div>
                          <div className="h-px bg-[var(--border)]" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted)]">Fare</span>
                            <span className="text-xl font-bold">
                              {selectedRoute.fare} ETB
                            </span>
                          </div>
                          {rfidBalance !== null && (
                            <>
                              <div className="h-px bg-[var(--border)]" />
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--muted)]">
                                  Balance After
                                </span>
                                <span
                                  className={`font-bold ${rfidBalance - selectedRoute.fare >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                >
                                  {(
                                    rfidBalance - selectedRoute.fare
                                  ).toLocaleString()}{" "}
                                  ETB
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Insufficient Balance Error */}
                        {balanceError && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4"
                          >
                            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-rose-500">
                                {balanceError}
                              </p>
                              <Link
                                href="/rfid-management"
                                className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                              >
                                <Wallet className="h-3 w-3" /> Recharge via
                                Telebirr
                              </Link>
                            </div>
                          </motion.div>
                        )}

                        <Button
                          size="lg"
                          className="w-full gap-2"
                          disabled={
                            booking ||
                            (rfidBalance !== null &&
                              rfidBalance < selectedRoute.fare)
                          }
                          onClick={confirmBooking}
                        >
                          {booking ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Booking...
                            </>
                          ) : (
                            <>
                              <Wallet className="h-4 w-4" /> Pay{" "}
                              {selectedRoute.fare} ETB from RFID Wallet
                            </>
                          )}
                        </Button>
                        <p className="text-center text-[10px] text-[var(--muted)]">
                          Fare will be deducted from your RFID card balance
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
