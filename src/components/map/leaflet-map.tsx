"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ACTIVE_BUSES,
  ADDIS_CENTER,
  DEFAULT_ZOOM,
  LOCAL_ROUTES,
  STATIONS,
  type BusData,
} from "@/constants/addis-ababa-routes";

/* ── Suppress default icon broken-path issue (Next.js / Webpack) ── */
// Must run only once on the client
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

/* ── Custom SVG Icons ── */

function createBusIcon(status: string, isSelected: boolean): L.DivIcon {
  const color =
    status === "online"      ? "#10b981" :
    status === "maintenance" ? "#f59e0b" : "#ef4444";
  const size = isSelected ? 44 : 36;
  const pulse = isSelected
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="none" stroke="${color}" stroke-width="2" opacity="0.4">
        <animate attributeName="r" from="${size / 2 - 6}" to="${size / 2}" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
       </circle>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${pulse}
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.24}" fill="${color}"/>
    <g transform="translate(${size / 2 - 5},${size / 2 - 5})">
      <rect x="1" y="1" width="8" height="6" rx="1" fill="white"/>
      <circle cx="3" cy="8.5" r="1" fill="white"/>
      <circle cx="7" cy="8.5" r="1" fill="white"/>
    </g>
  </svg>`;
  return L.divIcon({
    html: `<div class="bus-marker-wrapper" style="transition:transform 0.3s">${svg}</div>`,
    className: "custom-bus-marker",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size / 2],
  });
}

function createStationIcon(isTerminal: boolean): L.DivIcon {
  const size  = isTerminal ? 14 : 10;
  const color = isTerminal ? "#ff6b3d" : "#8b5cf6";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.2);box-shadow:0 0 10px ${color}80;transition:transform 0.2s;"></div>`,
    className:  "custom-station-marker",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 16px #3b82f680;"></div>`,
    className:  "custom-station-marker",
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
  });
}

/* ── Route palette ── */
const ROUTE_COLORS = [
  "#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6",
  "#ec4899","#06b6d4","#f97316","#84cc16",
];

/* ── Component props ── */
interface TransitMapProps {
  onBusSelect?:     (busId: string | null) => void;
  selectedBusId?:   string | null;
  className?:       string;
  showRouteLines?:  boolean;
  showStations?:    boolean;
  showUserLocation?:boolean;
  fullscreen?:      boolean;
  filterRoute?:     string;
}

export default function TransitMap({
  onBusSelect,
  selectedBusId,
  className,
  showRouteLines   = true,
  showStations     = true,
  showUserLocation = false,
  fullscreen       = false,  // kept for API compat, not used internally
  filterRoute,
}: TransitMapProps) {
  /* ── Refs ── */
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const busMarkersRef   = useRef<Map<string, L.Marker>>(new Map());
  const routeLinesRef   = useRef<L.Polyline[]>([]);
  const stationMrkRef   = useRef<L.Marker[]>([]);
  const userMarkerRef   = useRef<L.Marker | null>(null);
  const geoWatchRef     = useRef<number | null>(null);

  /* ── Simulated bus positions ── */
  const [busPositions, setBusPositions] = useState<Map<string, [number, number]>>(
    () => new Map(ACTIVE_BUSES.map((b) => [b.id, b.position])),
  );

  /* ─────────────────────────────────────────────────────────────────────────
   * EFFECT 1 — Simulate bus movement (entirely independent of the map)
   * ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions((prev) => {
        const next = new Map(prev);
        ACTIVE_BUSES.forEach((bus) => {
          if (bus.status !== "online") return;
          const current = next.get(bus.id) ?? bus.position;
          const target  = bus.route.to;
          const progress = 0.015 + Math.random() * 0.01;
          const dlat = (target.lat - current[0]) * progress;
          const dlng = (target.lng - current[1]) * progress;
          next.set(bus.id, [
            current[0] + dlat + (Math.random() - 0.5) * 0.0004,
            current[1] + dlng + (Math.random() - 0.5) * 0.0004,
          ]);
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
   * EFFECT 2 — Initialize Leaflet map (runs exactly once, client-only)
   *
   * KEY FIXES:
   *  • `mounted` flag prevents the async geolocation callback from touching
   *    a removed map after the component unmounts.
   *  • User marker is added via `mapRef.current` (not the stale local `map`
   *    closure variable) after null-checking the ref.
   *  • `watchPosition` is used instead of `getCurrentPosition` so the marker
   *    stays accurate without re-running the effect.
   *  • Cleanup cancels the geolocation watch and removes the Leaflet instance.
   * ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    // Guard: container div must exist and map must not already be initialized
    if (!mapContainerRef.current || mapRef.current) return;

    /* ── Create map ── */
    const map = L.map(mapContainerRef.current, {
      center:           ADDIS_CENTER,
      zoom:             DEFAULT_ZOOM,
      zoomControl:      false,
      attributionControl:false,
      preferCanvas:     true,
    });

    // Assign to ref *immediately* so concurrent effects and async callbacks
    // can safely check `mapRef.current !== null`
    mapRef.current = map;

    // Track whether this effect is still "alive" (component mounted)
    let mounted = true;

    /* ── Tile layer ── */
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" },
    ).addTo(map);

    /* ── Controls ── */
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control
      .attribution({ position: "bottomleft" })
      .addTo(map)
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' +
        ' &copy; <a href="https://carto.com/">CARTO</a>',
      );

    /* ── Station markers ── */
    if (showStations) {
      const terminals = new Set([
        "Megenagna","Merkato","Piassa","Mexico","4 Kilo","Bole","CMC",
      ]);
      Object.values(STATIONS).forEach((station) => {
        const marker = L.marker([station.lat, station.lng], {
          icon: createStationIcon(terminals.has(station.name)),
        })
          .bindTooltip(station.name, {
            permanent:  false,
            direction:  "top",
            className:  "station-tooltip",
            offset:     [0, -8],
          })
          .addTo(map);
        stationMrkRef.current.push(marker);
      });
    }

    /* ── Route polylines ── */
    if (showRouteLines) {
      LOCAL_ROUTES.forEach((route, i) => {
        if (filterRoute && route.label !== filterRoute) return;
        const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
        const from: [number, number] = [route.from.lat, route.from.lng];
        const to:   [number, number] = [route.to.lat,   route.to.lng];
        const midLat = (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 0.008;
        const midLng = (from[1] + to[1]) / 2 + (Math.random() - 0.5) * 0.008;

        const line = L.polyline(
          [from, [midLat, midLng], to],
          {
            color,
            weight:    filterRoute ? 4 : 2.5,
            opacity:   filterRoute ? 0.8 : 0.3,
            dashArray: filterRoute ? undefined : "6 4",
            smoothFactor: 2,
          },
        ).addTo(map);

        line.bindTooltip(route.label, {
          sticky:    true,
          className: "station-tooltip",
        });
        routeLinesRef.current.push(line);
      });
    }

    /* ── Bus markers ── */
    ACTIVE_BUSES.forEach((bus) => {
      const marker = L.marker(bus.position, {
        icon:        createBusIcon(bus.status, false),
        zIndexOffset:1000,
      })
        .bindPopup(
          `<div class="bus-popup">
            <div class="bus-popup-header">${bus.id}</div>
            <div class="bus-popup-route">${bus.route.label}</div>
            <div class="bus-popup-detail">🚌 Driver: ${bus.driver}</div>
            <div class="bus-popup-detail">⚡ Speed: ${bus.speed}</div>
            <div class="bus-popup-detail">👥 Passengers: ${bus.passengers}</div>
            <div class="bus-popup-detail">📍 Next: ${bus.nextStop} (${bus.eta})</div>
            <div class="bus-popup-detail">🔋 Status: <strong style="color:${bus.status === "online" ? "#10b981" : "#f59e0b"}">${bus.status}</strong></div>
          </div>`,
          { className: "bus-popup-container", maxWidth: 260 },
        )
        .addTo(map);

      marker.on("click", () => onBusSelect?.(bus.id));
      busMarkersRef.current.set(bus.id, marker);
    });

    /* ── User location (geolocation watchPosition) ──
     *
     * CRITICAL: the success callback is async, so by the time it runs the
     * component may have unmounted. We check two things before touching the map:
     *   1. `mounted` — is this effect still alive?
     *   2. `mapRef.current` — is the Leaflet instance still valid?
     *
     * We use `mapRef.current` (not the local `map` variable) because the ref
     * is set to null in cleanup, giving us a reliable liveness signal.
     * ── */
    if (showUserLocation && typeof navigator !== "undefined" && navigator.geolocation) {
      const handlePosition = (pos: GeolocationPosition) => {
        // Bail out if component unmounted or map was destroyed
        if (!mounted || !mapRef.current) return;

        const { latitude, longitude } = pos.coords;
        const liveMap = mapRef.current; // stable local reference after null-check

        if (userMarkerRef.current) {
          // Update existing marker position instead of creating a duplicate
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          // Create user location marker for the first time
          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: createUserLocationIcon(),
          })
            .bindTooltip("You are here", {
              permanent:  false,
              direction:  "top",
              className:  "station-tooltip",
            })
            .addTo(liveMap);
        }
      };

      const handleError = (_err: GeolocationPositionError) => {
        // Silently ignore — geolocation is optional
      };

      geoWatchRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
      );
    }

    /* ── Cleanup ── */
    return () => {
      mounted = false; // Signals all pending async callbacks to bail out

      // Cancel geolocation watch to prevent further callbacks
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }

      // Nullify ref BEFORE calling map.remove() so any in-flight callbacks
      // that check mapRef.current see null and bail out safely
      mapRef.current = null;

      map.remove();

      busMarkersRef.current.clear();
      routeLinesRef.current  = [];
      stationMrkRef.current  = [];
      userMarkerRef.current  = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — map initializes once

  /* ─────────────────────────────────────────────────────────────────────────
   * EFFECT 3 — Sync bus marker positions when simulation ticks
   * ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;
    busPositions.forEach((pos, busId) => {
      const marker = busMarkersRef.current.get(busId);
      if (marker) marker.setLatLng(pos);
    });
  }, [busPositions]);

  /* ─────────────────────────────────────────────────────────────────────────
   * EFFECT 4 — Fly to selected bus and highlight it
   * ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!selectedBusId || !mapRef.current) return;

    const pos = busPositions.get(selectedBusId);
    if (pos) {
      mapRef.current.flyTo(pos, 15, { duration: 0.8 });
      const marker = busMarkersRef.current.get(selectedBusId);
      if (marker) {
        marker.setIcon(createBusIcon("online", true));
        marker.openPopup();
      }
    }

    // Reset all other bus icons to non-selected state
    busMarkersRef.current.forEach((m, id) => {
      if (id !== selectedBusId) {
        const bus = ACTIVE_BUSES.find((b) => b.id === id);
        if (bus) m.setIcon(createBusIcon(bus.status, false));
      }
    });
  }, [selectedBusId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Render ── */
  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// Re-export BusData type for consumers that import it from this module
export type { BusData };
