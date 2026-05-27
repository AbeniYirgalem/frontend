"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TrackingSnapshot, NearbyBus } from "@/hooks/use-live-tracking";

// ── Icon factories ────────────────────────────────────────────────────────────

function createActiveBusIcon(heading: number) {
  const color = "#10b981"; // emerald
  const size = 46;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.5">
      <animate attributeName="r" from="${size / 2 - 8}" to="${size / 2 - 1}" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.33}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.22}" fill="${color}"/>
    <g transform="translate(${size / 2 - 6},${size / 2 - 6}) rotate(${heading},6,6)">
      <rect x="1" y="1" width="10" height="8" rx="2" fill="white"/>
      <circle cx="3" cy="10" r="1.5" fill="white"/>
      <circle cx="9" cy="10" r="1.5" fill="white"/>
      <polygon points="5,0 7,0 6,-3" fill="white" opacity="0.8"/>
    </g>
  </svg>`;
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 3px 10px rgba(16,185,129,0.6))">${svg}</div>`,
    className: "custom-bus-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createNearbyBusIcon() {
  const color = "#3b82f6"; // blue
  const size = 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.22}" fill="${color}"/>
    <g transform="translate(${size / 2 - 4},${size / 2 - 4})">
      <rect x="1" y="1" width="6" height="5" rx="1" fill="white"/>
      <circle cx="2.5" cy="7" r="1" fill="white"/>
      <circle cx="5.5" cy="7" r="1" fill="white"/>
    </g>
  </svg>`;
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 6px rgba(59,130,246,0.5))">${svg}</div>`,
    className: "custom-bus-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createTerminalIcon(color: string, label: string) {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color}80"></div>
      <div style="background:rgba(10,15,26,0.85);color:white;font-size:9px;padding:1px 5px;border-radius:4px;white-space:nowrap;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15)">${label}</div>
    </div>`,
    className: "custom-station-marker",
    iconSize: [80, 28],
    iconAnchor: [40, 7],
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TripTrackingMapProps {
  snapshot: TrackingSnapshot;
  className?: string;
}

export default function TripTrackingMap({
  snapshot,
  className,
}: TripTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const nearbyMarkersRef = useRef<L.Marker[]>([]);
  const progressLineRef = useRef<L.Polyline | null>(null);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const path = snapshot.routePath;
    const startLatLng = path[0] ?? [9.0192, 38.7525];
    const center: [number, number] = [
      (startLatLng[0] + (path[path.length - 1]?.[0] ?? startLatLng[0])) / 2,
      (startLatLng[1] + (path[path.length - 1]?.[1] ?? startLatLng[1])) / 2,
    ];

    const map = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    // Dark tile from CartoDB
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" },
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control
      .attribution({ position: "bottomleft" })
      .addTo(map)
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      );

    // Full route line (dim)
    routeLineRef.current = L.polyline(path as L.LatLngExpression[], {
      color: "#ff6b3d",
      weight: 4,
      opacity: 0.25,
      dashArray: "8 6",
      smoothFactor: 2,
    }).addTo(map);

    // Progress line (bright — portion bus has covered)
    progressLineRef.current = L.polyline(
      path.slice(0, 1) as L.LatLngExpression[],
      { color: "#10b981", weight: 4, opacity: 0.85, smoothFactor: 2 },
    ).addTo(map);

    // Start terminal marker
    L.marker(path[0] as L.LatLngExpression, {
      icon: createTerminalIcon("#ff6b3d", snapshot.from),
      zIndexOffset: 500,
    }).addTo(map);

    // End terminal marker
    const lastPt = path[path.length - 1];
    L.marker(lastPt as L.LatLngExpression, {
      icon: createTerminalIcon("#a855f7", snapshot.to),
      zIndexOffset: 500,
    }).addTo(map);

    // Main bus marker
    busMarkerRef.current = L.marker(
      [snapshot.bus.lat, snapshot.bus.lng],
      {
        icon: createActiveBusIcon(snapshot.bus.heading),
        zIndexOffset: 1000,
      },
    )
      .bindPopup(
        `<div class="bus-popup">
          <div class="bus-popup-header">${snapshot.bus.id}</div>
          <div class="bus-popup-route">${snapshot.from} → ${snapshot.to}</div>
          <div class="bus-popup-detail">⚡ Speed: ${snapshot.bus.speed} km/h</div>
          <div class="bus-popup-detail">⏱ ETA: ${snapshot.etaMinutes} min</div>
          <div class="bus-popup-detail">📍 Progress: ${Math.round(snapshot.bus.progress * 100)}%</div>
        </div>`,
        { className: "bus-popup-container" },
      )
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      busMarkerRef.current = null;
      routeLineRef.current = null;
      progressLineRef.current = null;
      nearbyMarkersRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update bus marker when snapshot changes ───────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !busMarkerRef.current) return;

    const { lat, lng, heading, progress, speed } = snapshot.bus;
    const eta = snapshot.etaMinutes;

    // Smoothly move the marker
    busMarkerRef.current.setLatLng([lat, lng]);
    busMarkerRef.current.setIcon(createActiveBusIcon(heading));

    // Update popup content
    busMarkerRef.current.setPopupContent(
      `<div class="bus-popup">
        <div class="bus-popup-header">${snapshot.bus.id}</div>
        <div class="bus-popup-route">${snapshot.from} → ${snapshot.to}</div>
        <div class="bus-popup-detail">⚡ Speed: ${speed} km/h</div>
        <div class="bus-popup-detail">⏱ ETA: ${eta} min</div>
        <div class="bus-popup-detail">📍 Progress: ${Math.round(progress * 100)}%</div>
      </div>`,
    );

    // Update progress polyline — show path covered so far
    if (progressLineRef.current && snapshot.routePath.length > 1) {
      const coveredCount = Math.max(
        1,
        Math.round(progress * snapshot.routePath.length),
      );
      progressLineRef.current.setLatLngs(
        snapshot.routePath.slice(0, coveredCount) as L.LatLngExpression[],
      );
    }

    // Fly map to bus on first real update (only if far from current center)
    const map = mapInstanceRef.current;
    const center = map.getCenter();
    const dist = map.distance(center, [lat, lng]);
    if (dist > 800) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.2 });
    }
  }, [snapshot]);

  // ── Update nearby bus markers ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old nearby markers
    nearbyMarkersRef.current.forEach((m) => m.remove());
    nearbyMarkersRef.current = [];

    // Add new ones
    snapshot.nearbyBuses.forEach((bus: NearbyBus) => {
      const m = L.marker([bus.lat, bus.lng], {
        icon: createNearbyBusIcon(),
        zIndexOffset: 800,
      })
        .bindTooltip(`${bus.id} · ${bus.speed} km/h`, {
          permanent: false,
          direction: "top",
          className: "station-tooltip",
        })
        .addTo(map);
      nearbyMarkersRef.current.push(m);
    });
  }, [snapshot.nearbyBuses]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
