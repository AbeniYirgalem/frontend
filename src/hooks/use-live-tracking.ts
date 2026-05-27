"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { api } from "@/services/api";

export type BusLocation = {
  bookingId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  progress: number;
  etaMinutes: number;
  routePath: [number, number][];
  updatedAt: string;
};

export type BusStatusEvent = {
  bookingId?: string;
  type: "arrival" | "delay" | "fault" | "reroute";
  message: string;
  severity?: string;
  updatedAt: string;
};

export type NearbyBus = {
  id: string;
  lat: number;
  lng: number;
  speed: number;
  status: string;
};

export type TrackingSnapshot = {
  bookingId: string;
  status: string;
  from: string;
  to: string;
  bus: { id: string; lat: number; lng: number; speed: number; heading: number; progress: number };
  routePath: [number, number][];
  nearbyBuses: NearbyBus[];
  etaMinutes: number;
  nearDestination: boolean;
};

type LiveTrackingState = {
  connected: boolean;
  snapshot: TrackingSnapshot | null;
  busLocation: BusLocation | null;
  statusEvents: BusStatusEvent[];
  loading: boolean;
  error: string | null;
};

export function useLiveTracking(bookingId: string | null) {
  const socket = useSocket();
  const [state, setState] = useState<LiveTrackingState>({
    connected: false,
    snapshot: null,
    busLocation: null,
    statusEvents: [],
    loading: true,
    error: null,
  });
  const joinedRef = useRef(false);

  // ── Fetch initial snapshot via REST ──────────────────────────────────────────
  const fetchSnapshot = useCallback(async () => {
    if (!bookingId) return;
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const data = await api<{ data: TrackingSnapshot }>(
        `/trip-bookings/${bookingId}/live`,
      );
      setState((s) => ({ ...s, snapshot: data.data, loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load tracking data",
      }));
    }
  }, [bookingId]);

  // ── Socket.IO subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;

    // Fetch REST snapshot on mount
    void fetchSnapshot();

    // Join the booking-scoped socket room
    if (!joinedRef.current) {
      socket.emit("tracking:join", { bookingId });
      joinedRef.current = true;
    }

    const onConnect = () => setState((s) => ({ ...s, connected: true }));
    const onDisconnect = () => setState((s) => ({ ...s, connected: false }));

    const onLocation = (data: BusLocation) => {
      if (data.bookingId !== bookingId) return;
      setState((s) => ({
        ...s,
        busLocation: data,
        // Keep snapshot in sync with live lat/lng
        snapshot: s.snapshot
          ? {
              ...s.snapshot,
              bus: {
                ...s.snapshot.bus,
                lat: data.lat,
                lng: data.lng,
                speed: data.speed,
                heading: data.heading,
                progress: data.progress,
              },
              etaMinutes: data.etaMinutes,
              routePath: data.routePath ?? s.snapshot.routePath,
            }
          : s.snapshot,
      }));
    };

    const onStatus = (event: BusStatusEvent) => {
      setState((s) => ({
        ...s,
        statusEvents: [event, ...s.statusEvents].slice(0, 10),
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("busLocationUpdate", onLocation);
    socket.on("busStatusUpdate", onStatus);

    if (socket.connected) setState((s) => ({ ...s, connected: true }));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("busLocationUpdate", onLocation);
      socket.off("busStatusUpdate", onStatus);
      socket.emit("tracking:leave", { bookingId });
      joinedRef.current = false;
    };
  }, [bookingId, socket, fetchSnapshot]);

  return { ...state, refetch: fetchSnapshot };
}
