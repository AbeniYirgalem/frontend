"use client";

import { useState, useRef, useCallback } from "react";
import {
  CreditCard, ScanLine, CheckCircle2, XCircle, Loader2, User, Wallet,
  Bus, MapPin, Volume2, AlertTriangle, Zap, History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScanResult = {
  success: boolean;
  message: string;
  data?: {
    passenger: { name: string; email: string };
    card: { cardUid: string; balanceBefore: number; balanceAfter: number; fareDeducted: number };
  };
};

type ScanLog = {
  id: string;
  cardUid: string;
  passenger: string;
  fare: number;
  result: "success" | "error";
  message: string;
  time: Date;
};

export default function RFIDScannerPage() {
  const [cardUid, setCardUid] = useState("");
  const [fare, setFare] = useState(15);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(async () => {
    if (!cardUid.trim()) return;
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/rfid/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid: cardUid.trim(), fare }),
      });
      const data: ScanResult = await res.json();
      setResult(data);

      // Log the scan
      setScanLogs((prev) => [
        {
          id: crypto.randomUUID(),
          cardUid: cardUid.trim(),
          passenger: data.data?.passenger?.name || "Unknown",
          fare,
          result: data.success ? "success" : "error",
          message: data.message,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);

      // Auto-focus input for next scan
      setTimeout(() => {
        setCardUid("");
        inputRef.current?.focus();
      }, 3000);
    } catch {
      setResult({ success: false, message: "Scanner connection error" });
    }
    setScanning(false);
  }, [cardUid, fare]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleScan();
  };

  const successCount = scanLogs.filter((l) => l.result === "success").length;
  const totalFare = scanLogs.filter((l) => l.result === "success").reduce((s, l) => s + l.fare, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">RFID Scanner</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Scan passenger RFID cards to validate and deduct fares</p>
          </motion.div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Scans Today", value: String(scanLogs.length), icon: ScanLine, color: "from-blue-500 to-cyan-500" },
              { label: "Successful", value: String(successCount), icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
              { label: "Failed", value: String(scanLogs.length - successCount), icon: XCircle, color: "from-rose-500 to-pink-500" },
              { label: "Fare Collected", value: `${totalFare} ETB`, icon: Wallet, color: "from-violet-500 to-purple-500" },
            ].map((s) => (
              <Card key={s.label} className="transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-[var(--muted)]">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            {/* Scanner Panel */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <ScanLine className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Scan RFID Card</h2>
                      <p className="text-xs text-[var(--muted)]">Enter card UID or scan with hardware reader</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Card Input */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">RFID Card UID</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                        <Input
                          ref={inputRef}
                          placeholder="e.g. RFID-4821"
                          className="h-12 pl-10 text-lg font-mono"
                          value={cardUid}
                          onChange={(e) => setCardUid(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Fare Input */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Trip Fare (ETB)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[10, 15, 20, 25].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFare(f)}
                            className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                              fare === f
                                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-white/5"
                            }`}
                          >
                            {f} ETB
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scan Button */}
                    <Button
                      size="lg"
                      className="w-full gap-2 text-base"
                      disabled={!cardUid.trim() || scanning}
                      onClick={handleScan}
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Scanning...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" /> Scan & Deduct {fare} ETB
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scan Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Card className={`border-2 ${result.success ? "border-emerald-500/40" : "border-rose-500/40"}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          {result.success ? (
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15"
                            >
                              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15"
                            >
                              <XCircle className="h-6 w-6 text-rose-500" />
                            </motion.div>
                          )}
                          <div>
                            <h3 className={`text-lg font-bold ${result.success ? "text-emerald-500" : "text-rose-500"}`}>
                              {result.success ? "Fare Deducted" : "Scan Failed"}
                            </h3>
                            <p className="text-sm text-[var(--muted)]">{result.message}</p>
                          </div>
                        </div>

                        {result.success && result.data && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-[var(--border)] p-3">
                              <p className="text-xs text-[var(--muted)] mb-1">Passenger</p>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[var(--primary)]" />
                                <span className="font-semibold">{result.data.passenger.name}</span>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--border)] p-3">
                              <p className="text-xs text-[var(--muted)] mb-1">Card</p>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[var(--primary)]" />
                                <span className="font-mono font-semibold">{result.data.card.cardUid}</span>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--border)] p-3">
                              <p className="text-xs text-[var(--muted)] mb-1">Fare Deducted</p>
                              <span className="text-lg font-bold text-rose-400">-{result.data.card.fareDeducted} ETB</span>
                            </div>
                            <div className="rounded-2xl border border-[var(--border)] p-3">
                              <p className="text-xs text-[var(--muted)] mb-1">Remaining Balance</p>
                              <span className="text-lg font-bold text-emerald-500">{result.data.card.balanceAfter} ETB</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scan History Sidebar */}
            <Card className="h-fit">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[var(--primary)]" />
                    <h2 className="font-semibold">Scan History</h2>
                  </div>
                  <Badge className="text-[10px]">{scanLogs.length}</Badge>
                </div>

                {scanLogs.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <ScanLine className="mb-2 h-8 w-8 text-[var(--muted)]" />
                    <p className="text-sm text-[var(--muted)]">No scans yet today</p>
                    <p className="text-xs text-[var(--muted)]">Scan results will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {scanLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`rounded-xl border p-3 ${
                          log.result === "success"
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-rose-500/20 bg-rose-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold font-mono">{log.cardUid}</span>
                          <Badge
                            variant={log.result === "success" ? "success" : "danger"}
                            className="text-[9px]"
                          >
                            {log.result}
                          </Badge>
                        </div>
                        <p className="text-xs">{log.passenger}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--muted)]">
                          <span>{log.result === "success" ? `-${log.fare} ETB` : log.message.slice(0, 30)}</span>
                          <span>{log.time.toLocaleTimeString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
