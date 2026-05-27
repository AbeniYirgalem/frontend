"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, BusFront, MapPinned, Route, Wifi } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type AdminOverview,
  type CongestionPoint,
  type Fault,
  type Notification,
  type RouteSuggestion,
  type VehicleLocation,
  fetchAdminOverview,
  fetchCongestion,
  fetchFaults,
  fetchNotifications,
  fetchPassengerFlow,
  fetchRouteSuggestions,
  fetchSolutions,
  fetchVehicleLocations,
} from "@/services/intelligence-service";

function severityVariant(level?: string) {
  if (level === "critical" || level === "high") return "danger";
  if (level === "medium") return "warning";
  return "success";
}

function MiniBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-[var(--primary)]"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [congestion, setCongestion] = useState<CongestionPoint[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [routes, setRoutes] = useState<RouteSuggestion[]>([]);
  const [solutions, setSolutions] = useState<Array<{ faultId: string; title: string; severity: string; action: string }>>([]);
  const [peakHours, setPeakHours] = useState<Array<{ _id: number; passengers: number }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [
          overviewData,
          congestionData,
          vehicleData,
          faultData,
          notificationData,
          routeData,
          solutionData,
          passengerFlowData,
        ] = await Promise.all([
          fetchAdminOverview(),
          fetchCongestion(),
          fetchVehicleLocations(),
          fetchFaults(),
          fetchNotifications("admin"),
          fetchRouteSuggestions("Central Station", "Westlands"),
          fetchSolutions(),
          fetchPassengerFlow(),
        ]);

        if (!active) return;
        setOverview(overviewData);
        setCongestion(congestionData);
        setVehicles(vehicleData);
        setFaults(faultData.items);
        setNotifications(notificationData);
        setRoutes(routeData);
        setSolutions(solutionData);
        setPeakHours(passengerFlowData.peakHours);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load transport intelligence",
          );
        }
      }
    }

    loadDashboard();
    const timer = window.setInterval(loadDashboard, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let socket: { on: (event: string, callback: (payload: any) => void) => void; disconnect: () => void } | null = null;

    async function connectSocket() {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "");
      if (!baseUrl) return;
      const { io } = await import("socket.io-client");
      socket = io(baseUrl, { transports: ["websocket"] });
      socket.on("transport:update", (payload) => {
        setOverview((current) =>
          current
            ? {
                ...current,
                queue: payload.queue,
                eta: payload.eta,
                availability: payload.availability,
                kpis: { ...current.kpis, liveFaults: payload.faults?.length || current.kpis.liveFaults },
              }
            : current,
        );
        setCongestion(payload.congestion || []);
        setVehicles(payload.vehicles || []);
        setFaults(payload.faults || []);
      });
      socket.on("transport:notification", (payload) => {
        setNotifications((current) => [payload, ...current].slice(0, 8));
      });
    }

    connectSocket();
    return () => socket?.disconnect();
  }, []);

  const maxPeak = useMemo(
    () => Math.max(1, ...peakHours.map((item) => item.passengers)),
    [peakHours],
  );

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-rose-500/40 text-sm text-rose-200">{error}</Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Active passengers"
          value={String(overview?.kpis.activePassengers ?? "...")}
          trend={`${overview?.kpis.tripsToday ?? 0} trips today`}
        />
        <StatsCard
          label="Active RFID cards"
          value={String(overview?.kpis.activeCards ?? "...")}
          trend={`${overview?.availability.level ?? "medium"} availability`}
        />
        <StatsCard
          label="Live faults"
          value={String(overview?.kpis.liveFaults ?? "...")}
          trend={`${overview?.queue.waitMinutes ?? 0} min central wait`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <BusFront className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold">Queue and ETA</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">{overview?.queue.station}</p>
              <p className="text-3xl font-semibold">{overview?.queue.queueLength ?? "--"}</p>
              <p className="text-xs text-muted">people in queue</p>
            </div>
            <div>
              <p className="text-sm text-muted">Next taxi</p>
              <p className="text-3xl font-semibold">{overview?.eta.etaMinutes ?? "--"}m</p>
              <p className="text-xs text-muted">{overview?.eta.confidence ?? "medium"} confidence</p>
            </div>
          </div>
          <MiniBar value={overview?.queue.density ?? 0} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-lg font-semibold">Availability</h3>
          </div>
          <p className="text-3xl font-semibold">{overview?.availability.activeVehicles ?? "--"}</p>
          <p className="text-sm text-muted">active taxis near Central Station</p>
          <Badge variant={severityVariant(overview?.availability.level)}>
            {overview?.availability.level ?? "loading"}
          </Badge>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-semibold">Live Alerts</h3>
          </div>
          {notifications.slice(0, 3).map((note) => (
            <div key={note._id} className="space-y-1 border-b border-white/10 pb-3 last:border-0">
              <p className="text-sm font-semibold">{note.title}</p>
              <p className="text-xs text-muted">{note.message}</p>
            </div>
          ))}
          {notifications.length === 0 ? <p className="text-sm text-muted">No live alerts.</p> : null}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold">Congestion Heatmap</h3>
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
            {congestion.map((point, index) => (
              <div
                key={point.stationName}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${18 + index * 18}%`,
                  top: `${28 + (point.density % 45)}%`,
                }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{
                    background:
                      point.level === "critical"
                        ? "rgba(225,29,72,0.78)"
                        : point.level === "high"
                          ? "rgba(245,158,11,0.78)"
                          : "rgba(14,165,233,0.72)",
                  }}
                  title={`${point.stationName}: ${point.density}%`}
                >
                  {point.density}%
                </div>
                <p className="mt-2 w-28 text-center text-xs">{point.stationName}</p>
              </div>
            ))}
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.vehicleId}
                className="absolute rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-semibold text-slate-950"
                style={{ left: `${12 + index * 22}%`, top: `${68 - index * 9}%` }}
              >
                {vehicle.vehicleId}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-300" />
            <h3 className="text-lg font-semibold">Fault Monitoring</h3>
          </div>
          <div className="space-y-3">
            {faults.map((fault) => (
              <div key={fault._id} className="rounded-2xl border border-white/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{fault.title}</p>
                  <Badge variant={severityVariant(fault.severity)}>{fault.severity}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted">{fault.description}</p>
              </div>
            ))}
            {faults.length === 0 ? <p className="text-sm text-muted">No active faults detected.</p> : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-lg font-semibold">Recommended Routes</h3>
          </div>
          {routes.map((route) => (
            <div key={route.id} className="space-y-1 rounded-2xl border border-white/10 p-3">
              <p className="text-sm font-semibold">{route.path.join(" -> ")}</p>
              <p className="text-xs text-muted">{route.estimatedMinutes} min · {route.reason}</p>
            </div>
          ))}
        </Card>

        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Suggested Actions</h3>
          {solutions.slice(0, 4).map((solution) => (
            <div key={solution.faultId} className="space-y-1">
              <p className="text-sm font-semibold">{solution.title}</p>
              <p className="text-xs text-muted">{solution.action}</p>
            </div>
          ))}
          {solutions.length === 0 ? <p className="text-sm text-muted">Recommendations will appear when faults are detected.</p> : null}
        </Card>

        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Peak-Hour Flow</h3>
          {peakHours.slice(0, 8).map((hour) => (
            <div key={hour._id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{String(hour._id).padStart(2, "0")}:00</span>
                <span>{hour.passengers}</span>
              </div>
              <MiniBar value={(hour.passengers / maxPeak) * 100} />
            </div>
          ))}
          {peakHours.length === 0 ? <p className="text-sm text-muted">Trip data will populate this chart.</p> : null}
        </Card>
      </div>
    </div>
  );
}
