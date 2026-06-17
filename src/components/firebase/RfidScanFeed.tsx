"use client";

/**
 * RfidScanFeed component.
 *
 * Location: frontend/src/components/firebase/RfidScanFeed.tsx
 *
 * Displays a scrollable, real-time feed of the most recent RFID card tap
 * events received from the ESP32 device via Firebase Realtime Database.
 *
 * Each entry shows the card UID, passenger count at time of scan, and a
 * human-readable timestamp. New entries animate in from the top.
 */

import { CreditCard, Users, Clock } from "lucide-react";
import type { BusLog } from "@/types/firebase";

interface RfidScanFeedProps {
  scans: (BusLog & { _key: string })[];
  loading?: boolean;
  maxVisible?: number;
}

function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.floor(Date.now() / 1000 - timestamp);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  return `${Math.floor(diffSeconds / 3600)}h ago`;
}

export function RfidScanFeed({ scans, loading = false, maxVisible = 8 }: RfidScanFeedProps) {
  const visible = scans.slice(0, maxVisible);

  return (
    <div className="firebase-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-400" />
          <h3 className="panel-title">RFID Scan Feed</h3>
        </div>
        <span className="badge-count">{scans.length} total</span>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rfid-skeleton animate-pulse" />
          ))
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No RFID scans yet</p>
            <p className="text-xs text-slate-600 mt-1">Waiting for ESP32 data…</p>
          </div>
        ) : (
          visible.map((scan, idx) => (
            <div
              key={scan._key}
              className="rfid-entry"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Card UID */}
              <div className="rfid-uid-wrap">
                <CreditCard className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <span className="rfid-uid">{scan.card_uid ?? "Unknown"}</span>
              </div>

              {/* Meta row */}
              <div className="rfid-meta">
                {scan.passenger_count != null && (
                  <span className="rfid-meta-item">
                    <Users className="w-3 h-3" />
                    {scan.passenger_count} on board
                  </span>
                )}
                <span className="rfid-meta-item">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(scan.timestamp)}
                </span>
              </div>

              {/* Bus / route badge */}
              {(scan.bus_id ?? scan.route_id) && (
                <div className="flex gap-1.5 mt-1.5">
                  {scan.bus_id && (
                    <span className="tag tag-bus">{scan.bus_id}</span>
                  )}
                  {scan.route_id && (
                    <span className="tag tag-route">{scan.route_id}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer: show overflow count */}
      {scans.length > maxVisible && (
        <p className="text-xs text-slate-500 text-center mt-3">
          + {scans.length - maxVisible} older scans
        </p>
      )}
    </div>
  );
}
