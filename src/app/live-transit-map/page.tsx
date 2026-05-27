"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Bus, Wifi, Navigation, Clock, MapPin, Users, Gauge, Search,
  Maximize2, Minimize2, Filter, X, Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTIVE_BUSES } from "@/constants/addis-ababa-routes";

const TransitMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <span className="text-sm text-[var(--muted)]">Loading map…</span>
      </div>
    </div>
  ),
});


const statusFilter = ["all", "online", "maintenance", "offline"] as const;


export default function LiveTransitMapPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredBuses = ACTIVE_BUSES.filter((bus) => {
    const matchesSearch =
      bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || bus.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const onlineBuses = ACTIVE_BUSES.filter((b) => b.status === "online").length;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className={`mx-auto ${fullscreen ? "max-w-full" : "max-w-7xl"}`}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Live Transit Map</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Real-time bus tracking across Addis Ababa · {onlineBuses} buses online
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                <Wifi className="mr-1.5 h-3 w-3" /> Live
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
                className="gap-1 hidden md:flex"
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {fullscreen ? "Exit" : "Fullscreen"}
              </Button>
            </div>
          </motion.div>

          <div className={`grid grid-cols-1 gap-6 ${fullscreen ? "" : "lg:grid-cols-[1fr_320px]"}`}>
            {/* Map Area */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden">
                <CardContent className="relative p-0">
                  <div className={`relative overflow-hidden rounded-xl ${fullscreen ? "h-[75vh]" : "h-[420px] md:h-[560px]"}`}>
                    <TransitMap
                      onBusSelect={setSelectedBusId}
                      selectedBusId={selectedBusId}
                      className="h-full w-full"
                      showUserLocation
                    />

                    {/* Map Legend Overlay */}
                    <div className="absolute bottom-4 left-4 z-[500] rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-3 text-[10px] space-y-1.5 hidden md:block">
                      <p className="text-xs font-semibold mb-1">Legend</p>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Online Bus
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Maintenance
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Offline
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b3d]" /> Station
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Your Location
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-px w-4 border-t-2 border-dashed border-[#ff6b3d]/50" /> Route
                      </div>
                    </div>

                    {/* Selected Bus Info Overlay */}
                    <AnimatePresence>
                      {selectedBusId && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute top-4 right-4 z-[500] w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-4"
                        >
                          {(() => {
                            const bus = ACTIVE_BUSES.find((b) => b.id === selectedBusId);
                            if (!bus) return null;
                            return (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold">{bus.id}</span>
                                  <button onClick={() => setSelectedBusId(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-[var(--primary)] font-medium mb-2">{bus.route.label}</p>
                                <div className="space-y-1 text-[11px] text-[var(--muted)]">
                                  <p>🚌 Driver: {bus.driver}</p>
                                  <p>⚡ Speed: {bus.speed}</p>
                                  <p>👥 Passengers: {bus.passengers}</p>
                                  <p>📍 Next: <span className="text-[var(--foreground)]">{bus.nextStop}</span> ({bus.eta})</p>
                                </div>
                              </>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar — Active Buses */}
            {!fullscreen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold">Active Buses</h2>
                      <Badge className="text-[10px]">{filteredBuses.length}</Badge>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
                      <Input
                        placeholder="Search bus, route, driver..."
                        className="h-9 pl-9 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filters */}
                    <div className="mb-3 flex items-center gap-1">
                      <Filter className="h-3 w-3 text-[var(--muted)]" />
                      {statusFilter.map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-all ${
                            activeFilter === f
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : "text-[var(--muted)] hover:bg-white/5"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    {/* Bus List */}
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                      {filteredBuses.map((bus) => (
                        <div
                          key={bus.id}
                          onClick={() => setSelectedBusId(bus.id)}
                          className={`cursor-pointer rounded-2xl border p-3 transition-all duration-200 hover:bg-white/5 ${
                            selectedBusId === bus.id
                              ? "border-[var(--primary)]/50 bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/5"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`pulse-dot ${
                                  bus.status === "online"
                                    ? "bg-emerald-500"
                                    : bus.status === "maintenance"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: 7, height: 7 }}
                              />
                              <span className="text-sm font-bold">{bus.id}</span>
                            </div>
                            <Badge className="bg-blue-500/15 text-blue-400 text-[10px]">{bus.speed}</Badge>
                          </div>
                          <p className="text-xs text-[var(--muted)] mb-1">{bus.route.label}</p>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--muted)]">
                              <Users className="mr-1 inline h-3 w-3" />{bus.passengers} pax
                            </span>
                            <span className="text-[var(--muted)]">
                              Next: <span className="text-[var(--foreground)]">{bus.nextStop}</span> ({bus.eta})
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredBuses.length === 0 && (
                        <p className="py-8 text-center text-xs text-[var(--muted)]">No buses match your search.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>


          {/* Bottom Stats — derived from live ACTIVE_BUSES data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {[
              {
                label: "Buses Online",
                value: String(ACTIVE_BUSES.filter((b) => b.status === "online").length),
                icon: Bus,
                color: "from-emerald-500 to-teal-500",
              },
              {
                label: "In Maintenance",
                value: String(ACTIVE_BUSES.filter((b) => b.status === "maintenance").length),
                icon: Gauge,
                color: "from-amber-500 to-orange-500",
              },
              {
                label: "Total Fleet",
                value: String(ACTIVE_BUSES.length),
                icon: Navigation,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Routes Active",
                value: String(new Set(ACTIVE_BUSES.map((b) => b.route.label)).size),
                icon: Clock,
                color: "from-violet-500 to-purple-500",
              },
            ].map((s) => (
              <Card key={s.label} className="transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}
                  >
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-[var(--muted)]">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>

      </main>
    </div>
  );
}
