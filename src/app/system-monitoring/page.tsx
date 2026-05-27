"use client";

import {
  Bus, Users, Wifi, WifiOff, AlertTriangle, Shield, Clock,
  Activity, CheckCircle2, Info, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const topMetrics = [
  { label: "Active Buses", value: "28 / 42", sub: "Online", icon: Bus, color: "from-blue-500 to-cyan-500" },
  { label: "Drivers on Duty", value: "24", sub: "3 on break", icon: Users, color: "from-emerald-500 to-teal-500" },
  { label: "System Uptime", value: "99.7%", sub: "Last 30 days", icon: Shield, color: "from-violet-500 to-purple-500" },
  { label: "Active Alerts", value: "3", sub: "1 critical", icon: AlertTriangle, color: "from-orange-500 to-amber-500" },
];

const buses = [
  { id: "AA-001", route: "Goro → Megenagna", driver: "Abebe K.", status: "online", speed: "32 km/h" },
  { id: "AA-008", route: "Bole → Mexico", driver: "Dawit M.", status: "online", speed: "28 km/h" },
  { id: "AA-012", route: "CMC → Piassa", driver: "Selam T.", status: "online", speed: "22 km/h" },
  { id: "AA-017", route: "4 Kilo → Merkato", driver: "Yonas G.", status: "online", speed: "25 km/h" },
  { id: "AA-023", route: "Kazanchis → Saris", driver: "Hana B.", status: "offline", speed: "—" },
  { id: "AA-031", route: "Summit → Ayat", driver: "Kidus A.", status: "online", speed: "30 km/h" },
  { id: "AA-035", route: "Torhailoch → Lebu", driver: "Tigist W.", status: "maintenance", speed: "—" },
  { id: "AA-042", route: "Megenagna → CMC", driver: "Belay F.", status: "online", speed: "26 km/h" },
];

const alerts = [
  { severity: "critical", title: "Engine warning on Bus AA-035", desc: "Temperature sensor reading above threshold. Bus pulled at Torhailoch depot.", time: "14 min ago" },
  { severity: "warning", title: "Bus AA-023 connectivity lost", desc: "GPS signal lost near Kazanchis. Last known position updated.", time: "28 min ago" },
  { severity: "info", title: "Route optimization available", desc: "AI suggests rerouting Bole-Mexico buses via Meskel Sq. during peak hours.", time: "1 hr ago" },
];

const chartBars = [35, 52, 48, 70, 65, 80, 74, 90, 85, 68, 72, 88];
const chartLabels = ["6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p"];

export default function SystemMonitoringPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">System Monitoring</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Real-time fleet and infrastructure status</p>
            </div>
            <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <span className="pulse-dot mr-2 bg-emerald-500" style={{ width: 8, height: 8 }} />
              All Systems Operational
            </Badge>
          </motion.div>

          {/* Top Metrics */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topMetrics.map((m) => (
              <motion.div key={m.label} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card className="transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[var(--muted)]">{m.label}</p>
                        <p className="mt-1 text-2xl font-bold">{m.value}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">{m.sub}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color}`}>
                        <m.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bus Fleet */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Bus Fleet Status</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {buses.map((b) => (
                      <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3 transition-colors hover:bg-white/5">
                        <span className={`pulse-dot ${b.status === "online" ? "bg-emerald-500" : b.status === "maintenance" ? "bg-amber-500" : "bg-rose-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{b.id}</span>
                            <Badge variant={b.status === "online" ? "success" : b.status === "maintenance" ? "warning" : "danger"} className="text-[10px] px-1.5 py-0">
                              {b.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-[var(--muted)]">{b.route}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--muted)]">{b.driver}</p>
                          <p className="text-xs font-medium">{b.speed}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">System Alerts</h2>
                  <div className="space-y-3">
                    {alerts.map((a, i) => (
                      <div key={i} className="rounded-xl border border-[var(--border)] p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {a.severity === "critical" ? <AlertTriangle className="h-4 w-4 text-rose-500" /> : a.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <Info className="h-4 w-4 text-blue-400" />}
                          <Badge variant={a.severity === "critical" ? "danger" : a.severity === "warning" ? "warning" : "default"} className="text-[10px]">
                            {a.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">{a.desc}</p>
                        <p className="mt-1 text-[10px] text-[var(--muted)]">{a.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Passenger Flow — Today</h2>
                  <Badge className="bg-white/5 text-[var(--muted)]">Hourly</Badge>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {chartBars.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="stat-bar w-full bg-gradient-to-t from-[var(--primary)] to-[var(--accent)]" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
                      <span className="text-[10px] text-[var(--muted)]">{chartLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
