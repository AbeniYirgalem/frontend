"use client";

/**
 * ESP32 Telemetry Dashboard page.
 *
 * Location: frontend/src/app/dashboard/esp32/page.tsx
 *
 * A premium real-time dashboard for monitoring ESP32 bus telemetry data
 * streamed through Firebase Realtime Database. Shows:
 *   • Live passenger count & occupancy gauge
 *   • Current GPS coordinates
 *   • Recent RFID card tap feed
 *   • Active emergency alerts
 *   • Connection status & last-update timestamp
 *
 * All data updates in real-time without page refresh via Firebase onValue()
 * listeners (see use-firebase-telemetry hook).
 */

import { useState } from "react";
import {
  Users,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Bus,
  Activity,
  Navigation,
  Zap,
} from "lucide-react";
import { useBusDashboard } from "@/hooks/use-bus-dashboard";
import { TelemetryCard } from "@/components/firebase/TelemetryCard";
import { RfidScanFeed } from "@/components/firebase/RfidScanFeed";
import { EmergencyAlerts } from "@/components/firebase/EmergencyAlerts";
import { OccupancyGauge } from "@/components/firebase/OccupancyGauge";

// ─── Inline styles injected via a style tag ───────────────────────────────────
const PAGE_STYLES = `
  .esp32-page {
    min-height: 100vh;
    background: #080c14;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    padding: 0;
  }

  /* Top gradient banner */
  .esp32-header {
    background: linear-gradient(135deg, #0f172a 0%, #1a1035 50%, #0f172a 100%);
    border-bottom: 1px solid rgba(139, 92, 246, 0.15);
    padding: 1.25rem 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px);
  }

  .esp32-header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .esp32-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .esp32-logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
  }

  .esp32-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }

  .esp32-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.1rem;
  }

  /* Connection badge */
  .conn-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    border: 1px solid;
    transition: all 0.3s;
  }
  .conn-badge.online {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.3);
  }
  .conn-badge.offline {
    background: rgba(244, 63, 94, 0.12);
    color: #fb7185;
    border-color: rgba(244, 63, 94, 0.3);
  }

  /* Bus selector */
  .bus-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.6rem;
    padding: 0.4rem 0.85rem;
    font-size: 0.8rem;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;
  }
  .bus-selector:hover { border-color: rgba(124,58,237,0.5); color: #e2e8f0; }
  .bus-selector input {
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-size: inherit;
    width: 120px;
  }

  /* Main grid */
  .esp32-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .esp32-grid {
    display: grid;
    gap: 1.25rem;
  }

  /* Top row: 4 metric cards */
  .metrics-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  /* Middle row: gauge | rfid feed | alerts (3 cols) */
  .middle-row {
    display: grid;
    grid-template-columns: 280px 1fr 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .middle-row { grid-template-columns: 1fr 1fr; }
    .middle-row > :first-child { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    .middle-row { grid-template-columns: 1fr; }
    .esp32-main { padding: 1rem; }
  }

  /* Panel card base */
  .firebase-panel {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1rem;
    padding: 1.5rem;
    backdrop-filter: blur(8px);
    transition: border-color 0.3s;
  }
  .firebase-panel:hover { border-color: rgba(255,255,255,0.12); }

  /* Metric card variant */
  .telemetry-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1rem;
    padding: 1.5rem;
    backdrop-filter: blur(8px);
    transition: border-color 0.3s, transform 0.2s;
    cursor: default;
  }
  .telemetry-card:hover {
    border-color: rgba(255,255,255,0.14);
    transform: translateY(-2px);
  }

  .telemetry-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
  }

  .telemetry-value {
    font-size: 2rem;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .telemetry-subtext {
    font-size: 0.7rem;
    color: #475569;
    margin-top: 0.2rem;
  }

  .telemetry-icon-wrap {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Live dot */
  .live-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: livePulse 1.5s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.75); }
  }

  /* Panel heading */
  .panel-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #cbd5e1;
    letter-spacing: -0.01em;
  }

  /* RFID entry */
  .rfid-entry {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 0.75rem;
    padding: 0.875rem 1rem;
    animation: slideInDown 0.25s ease both;
    transition: background 0.2s;
  }
  .rfid-entry:hover { background: rgba(255,255,255,0.055); }

  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rfid-uid-wrap {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    margin-bottom: 0.35rem;
  }

  .rfid-uid {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: #a78bfa;
    letter-spacing: 0.04em;
  }

  .rfid-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.7rem;
    color: #64748b;
  }

  .rfid-meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  /* Badge pills */
  .tag {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid;
  }
  .tag-bus  { background: rgba(59,130,246,0.1); color: #60a5fa; border-color: rgba(59,130,246,0.25); }
  .tag-route { background: rgba(124,58,237,0.1); color: #a78bfa; border-color: rgba(124,58,237,0.25); }

  /* Skeletons */
  .rfid-skeleton {
    height: 72px;
    background: rgba(255,255,255,0.05);
    border-radius: 0.75rem;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #475569;
  }

  /* Badge count */
  .badge-count {
    font-size: 0.7rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9999px;
    padding: 0.15rem 0.6rem;
    color: #64748b;
  }

  /* Scrollbar */
  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  /* Last-updated bar */
  .update-bar {
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 0.75rem;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.72rem;
    color: #475569;
  }

  /* GPS coords card extra */
  .gps-coords {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }
  .gps-coord-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .gps-coord-label {
    width: 1.5rem;
    font-weight: 700;
    color: #475569;
    font-size: 0.65rem;
    text-transform: uppercase;
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Esp32DashboardPage() {
  const [busId, setBusId] = useState("");
  const [inputBusId, setInputBusId] = useState("");

  const {
    passengerCount,
    capacity,
    occupancyPct,
    gpsLocation,
    rfidScans,
    emergencyAlerts,
    lastUpdated,
    isConnected,
  } = useBusDashboard(busId || undefined);

  const activeAlerts = emergencyAlerts.filter((a) => !a.acknowledged);

  function handleBusIdSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusId(inputBusId.trim());
  }

  function formatLastUpdated(d: Date | null) {
    if (!d) return "No data yet";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  return (
    <>
      {/* Inject scoped styles */}
      <style>{PAGE_STYLES}</style>

      {/* Import Inter font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="esp32-page">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="esp32-header">
          <div className="esp32-header-inner">
            {/* Logo + title */}
            <div className="esp32-logo">
              <div className="esp32-logo-icon">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="esp32-title">ESP32 Telemetry</p>
                <p className="esp32-subtitle">Firebase Realtime Dashboard</p>
              </div>
            </div>

            {/* Bus ID filter */}
            <form onSubmit={handleBusIdSubmit} className="bus-selector">
              <Bus className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter by Bus ID…"
                value={inputBusId}
                onChange={(e) => setInputBusId(e.target.value)}
                aria-label="Filter by bus ID"
              />
              {busId && (
                <button
                  type="button"
                  onClick={() => { setBusId(""); setInputBusId(""); }}
                  className="text-slate-500 hover:text-slate-300 text-xs ml-1"
                  aria-label="Clear filter"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Connection badge */}
            <div className={`conn-badge ${isConnected ? "online" : "offline"}`}>
              {isConnected
                ? <><Wifi className="w-3.5 h-3.5" /> Firebase Live</>
                : <><WifiOff className="w-3.5 h-3.5" /> Disconnected</>
              }
            </div>
          </div>
        </header>

        {/* ── Main content ────────────────────────────────────────────────────── */}
        <main className="esp32-main">
          <div className="esp32-grid" style={{ gap: "1.25rem" }}>

            {/* ── Row 1: 4 metric cards ─────────────────────────────────────── */}
            <div className="metrics-row">
              {/* Passenger Count */}
              <TelemetryCard
                label="Passengers On Board"
                value={passengerCount}
                subtext={`of ${capacity} capacity`}
                icon={<Users className="w-5 h-5" />}
                accentClass="bg-blue-500/20 text-blue-400"
                isLive={isConnected}
                trend={
                  occupancyPct >= 90
                    ? "⚠️ Bus nearly full"
                    : occupancyPct >= 70
                      ? "Filling up"
                      : "Plenty of space"
                }
                trendType={occupancyPct >= 90 ? "negative" : occupancyPct >= 70 ? "neutral" : "positive"}
              />

              {/* GPS Location */}
              <TelemetryCard
                label="GPS Coordinates"
                value={
                  gpsLocation
                    ? `${gpsLocation.lat.toFixed(5)}`
                    : "No fix"
                }
                subtext={
                  gpsLocation
                    ? `${gpsLocation.lng.toFixed(5)} lng`
                    : "Waiting for GPS data"
                }
                icon={<MapPin className="w-5 h-5" />}
                accentClass="bg-emerald-500/20 text-emerald-400"
                isLive={isConnected && gpsLocation != null}
                trend={
                  gpsLocation?.speed != null
                    ? `${gpsLocation.speed} km/h`
                    : undefined
                }
                trendType="neutral"
              />

              {/* RFID Scans */}
              <TelemetryCard
                label="RFID Scans Today"
                value={rfidScans.length}
                subtext="Card tap events"
                icon={<Activity className="w-5 h-5" />}
                accentClass="bg-violet-500/20 text-violet-400"
                isLive={isConnected}
              />

              {/* Emergency Alerts */}
              <TelemetryCard
                label="Active Alerts"
                value={activeAlerts.length}
                subtext={activeAlerts.length === 0 ? "All systems normal" : "Requires attention"}
                icon={<Navigation className="w-5 h-5" />}
                accentClass={
                  activeAlerts.length > 0
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-slate-500/20 text-slate-400"
                }
                isLive={isConnected}
                trend={activeAlerts.length > 0 ? `${activeAlerts.length} unacknowledged` : undefined}
                trendType={activeAlerts.length > 0 ? "negative" : "positive"}
              />
            </div>

            {/* ── Row 2: Gauge | RFID Feed | Alerts ─────────────────────────── */}
            <div className="middle-row">
              {/* Occupancy Gauge */}
              <OccupancyGauge
                percentage={occupancyPct}
                currentCount={passengerCount}
                capacity={capacity}
              />

              {/* RFID Scan Feed */}
              <div style={{ minHeight: "340px" }}>
                <RfidScanFeed scans={rfidScans} maxVisible={8} />
              </div>

              {/* Emergency Alerts */}
              <div style={{ minHeight: "340px" }}>
                <EmergencyAlerts alerts={emergencyAlerts} />
              </div>
            </div>

            {/* ── Row 3: Last-updated status bar ────────────────────────────── */}
            <div className="update-bar">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Last updated: <strong className="text-slate-300">{formatLastUpdated(lastUpdated)}</strong>
              </span>
              {busId && (
                <span className="flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-violet-400" />
                  Watching bus:
                  <strong className="text-violet-400">{busId}</strong>
                </span>
              )}
              <span>
                Firebase ·{" "}
                <span className="text-slate-500">
                  bus-ticketing-f813c-default-rtdb
                </span>
              </span>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
