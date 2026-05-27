"use client";

import { useState, useEffect } from "react";
import {
  CreditCard, Activity, TrendingUp, Users, Shield, ShieldOff,
  Wallet, Clock, ArrowUpRight, ArrowDownLeft, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RFIDStats = {
  totalCards: number;
  activeCards: number;
  suspendedCards: number;
  expiredCards: number;
  totalBalanceCirculation: number;
  todayRevenue: number;
  todayRecharges: number;
  todayRechargeAmount: number;
  todayScans: number;
  weeklyRevenue?: { day: string; revenue: number }[];
  rechargeBreakdown?: Record<string, number>;
  recentActivity: { type: string; card: string; amount: number; time: string }[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(value);
}

export default function RFIDManagementPage() {
  const [stats, setStats] = useState<RFIDStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rfid/stats");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch { /* empty */ }
      setLoading(false);
    })();
  }, []);

  const statCards = stats
    ? [
        { label: "Total Cards", value: money(stats.totalCards), icon: CreditCard, color: "from-blue-500 to-cyan-500" },
        { label: "Active Cards", value: money(stats.activeCards), icon: Shield, color: "from-emerald-500 to-teal-500" },
        { label: "Suspended", value: money(stats.suspendedCards), icon: ShieldOff, color: "from-rose-500 to-pink-500" },
        { label: "Scans Today", value: money(stats.todayScans), icon: Activity, color: "from-violet-500 to-purple-500" },
      ]
    : [];

  const financeCards = stats
    ? [
        { label: "Today's Revenue", value: `${money(stats.todayRevenue)} ETB`, icon: TrendingUp, color: "from-emerald-500 to-green-500" },
        { label: "Today's Recharges", value: `${stats.todayRecharges} txns`, icon: ArrowUpRight, color: "from-blue-500 to-indigo-500" },
        { label: "Recharge Volume", value: `${money(stats.todayRechargeAmount || 0)} ETB`, icon: Wallet, color: "from-amber-500 to-orange-500" },
        { label: "Balance in System", value: `${money(stats.totalBalanceCirculation)} ETB`, icon: BarChart3, color: "from-purple-500 to-pink-500" },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">RFID Analytics</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Monitor RFID transit system performance, revenue, and card activity</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : stats ? (
            <>
              {/* Card Stats */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {statCards.map((s) => (
                  <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }}>
                    <Card className="transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}>
                          <s.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="text-xs text-[var(--muted)]">{s.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Finance Stats */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
                className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {financeCards.map((s) => (
                  <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }}>
                    <Card className="transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}>
                          <s.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold">{s.value}</p>
                          <p className="text-xs text-[var(--muted)]">{s.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Revenue Chart + Activity Feed */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                {/* Weekly Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardContent className="p-5">
                      <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[var(--primary)]" /> Weekly Revenue Trend
                      </h2>
                      <div className="flex items-end gap-3 h-48">
                        {(stats.weeklyRevenue || [
                          { day: "Mon", revenue: 42100 }, { day: "Tue", revenue: 38500 },
                          { day: "Wed", revenue: 45200 }, { day: "Thu", revenue: 41800 },
                          { day: "Fri", revenue: 52400 }, { day: "Sat", revenue: 35600 },
                          { day: "Sun", revenue: 28900 },
                        ]).map((d) => {
                          const maxRev = 55000;
                          const height = Math.max(8, (d.revenue / maxRev) * 100);
                          return (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                              <p className="text-[10px] text-[var(--muted)]">{money(d.revenue)}</p>
                              <div
                                className="w-full rounded-t-xl bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/60 transition-all duration-500"
                                style={{ height: `${height}%` }}
                              />
                              <p className="text-xs font-medium text-[var(--muted)]">{d.day}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Real-time Activity Feed */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="h-fit">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                          <Activity className="h-4 w-4 text-[var(--primary)]" /> Live Activity
                        </h2>
                        <div className="flex items-center gap-1.5">
                          <span className="pulse-dot bg-emerald-500" style={{ width: 7, height: 7 }} />
                          <span className="text-[10px] text-emerald-500">Live</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {stats.recentActivity.map((a, i) => (
                          <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 transition-colors hover:bg-white/3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                a.type === "recharge"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-rose-500/15 text-rose-500"
                              }`}>
                                {a.type === "recharge" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold font-mono">{a.card}</p>
                                <p className="text-[10px] text-[var(--muted)] capitalize">{a.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-bold ${a.type === "recharge" ? "text-emerald-500" : "text-rose-400"}`}>
                                {a.type === "recharge" ? "+" : "-"}{a.amount} ETB
                              </p>
                              <p className="text-[9px] text-[var(--muted)]">
                                {typeof a.time === "string" && a.time.includes("ago") ? a.time : new Date(a.time).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : (
            <Card className="text-center py-12 text-[var(--muted)]">
              Unable to load RFID analytics
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
