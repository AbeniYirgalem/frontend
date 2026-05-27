"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bus,
  Users,
  Route,
  TrendingUp,
  Activity,
  Clock,
  Map,
  CreditCard,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const stats = [
  {
    label: "Active Buses",
    value: "42",
    change: "+3 today",
    icon: Bus,
    color: "from-orange-500 to-amber-500",
  },
  {
    label: "Total Passengers",
    value: "12,847",
    change: "+284 today",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "Active Routes",
    value: "18",
    change: "2 new this week",
    icon: Route,
    color: "from-emerald-500 to-teal-500",
  },
  {
    label: "On-Time Rate",
    value: "96.4%",
    change: "+1.2% vs last week",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-500",
  },
];

const recentActivity = [
  {
    message: "Bus AA-042 departed Megenagna → CMC",
    time: "2 min ago",
    icon: Bus,
    status: "success",
  },
  {
    message: "RFID scan: Card #4821 tapped at CMC Station",
    time: "5 min ago",
    icon: CreditCard,
    status: "default",
  },
  {
    message: "Bus AA-017 arrived at 4 Kilo Terminal",
    time: "12 min ago",
    icon: CheckCircle2,
    status: "success",
  },
  {
    message: "Bus AA-008 delayed — traffic on Bole Road near Atlas",
    time: "18 min ago",
    icon: AlertTriangle,
    status: "warning",
  },
  {
    message: "Bus AA-031 departed Summit → Ayat",
    time: "24 min ago",
    icon: Bus,
    status: "success",
  },
];

const quickActions = [
  {
    title: "Monitor System",
    desc: "Real-time fleet status",
    href: "/system-monitoring",
    icon: Activity,
    color: "from-blue-500/20 to-cyan-500/20",
    ic: "text-blue-400",
  },
  {
    title: "View Trips",
    desc: "Trip history & analytics",
    href: "/trip-history",
    icon: Clock,
    color: "from-emerald-500/20 to-teal-500/20",
    ic: "text-emerald-400",
  },
  {
    title: "Open Map",
    desc: "Live bus tracking",
    href: "/live-transit-map",
    icon: Map,
    color: "from-violet-500/20 to-purple-500/20",
    ic: "text-violet-400",
  },
  {
    title: "Manage RFID",
    desc: "Cards & scan history",
    href: "/rfid-management",
    icon: CreditCard,
    color: "from-orange-500/20 to-amber-500/20",
    ic: "text-orange-400",
  },
];

export default function HomePage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-24 md:pb-32 md:pt-36">
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/banner6.jpg"
              alt="Transit fleet"
              fill
              priority
              className="object-cover object-center scale-105 animate-[heroZoom_20s_ease-in-out_infinite_alternate]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[var(--background)]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="animate-float absolute -right-20 top-20 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
              <div
                className="animate-float absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-[var(--accent)]/10 blur-3xl"
                style={{ animationDelay: "3s" }}
              />
            </div>
          </div>
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                <Badge className="mx-auto mb-4 border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                  <Zap className="mr-1.5 h-3 w-3" /> Addis Ababa Real-Time
                  Transit
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl drop-shadow-lg"
              >
                Smart <span className="gradient-text">Transit</span>
                <br />
                Management
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl"
              >
                Monitor Addis Ababa&apos;s bus fleet in real-time. Track buses
                from Goro to Megenagna, CMC to Piassa, and every route in
                between.
              </motion.p>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-4"
              >
                <Button size="lg" asChild>
                  <Link href="/system-monitoring">
                    <Activity className="mr-2 h-4 w-4" />
                    Open Monitoring
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/live-transit-map">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Live Map
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section ref={statsRef} className="px-4 pb-16">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={stagger}
            className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-[var(--muted)]">{s.label}</p>
                        <span className="text-3xl font-bold tracking-tight">
                          {s.value}
                        </span>
                        <p className="flex items-center gap-1 text-xs text-emerald-500">
                          <TrendingUp className="h-3 w-3" />
                          {s.change}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}
                      >
                        <s.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Activity + Actions */}
        <section className="px-4 pb-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <div className="flex items-center gap-2">
                      <span className="pulse-dot bg-emerald-500" />
                      <span className="text-xs text-emerald-500">Live</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {recentActivity.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${e.status === "success" ? "bg-emerald-500/15 text-emerald-500" : e.status === "warning" ? "bg-amber-500/15 text-amber-500" : "bg-white/10 text-[var(--muted)]"}`}
                        >
                          <e.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{e.message}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">
                            {e.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-5 text-lg font-semibold">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((a) => (
                      <Link key={a.href} href={a.href}>
                        <div className="group flex items-center gap-3 rounded-2xl border border-transparent p-3.5 transition-all duration-200 hover:border-[var(--border)] hover:bg-white/5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.color}`}
                          >
                            <a.icon className={`h-5 w-5 ${a.ic}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{a.title}</p>
                            <p className="text-xs text-[var(--muted)]">
                              {a.desc}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[var(--muted)] transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
