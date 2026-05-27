"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/providers/wallet-provider";
import { AnimatedBalance } from "@/components/rfid/animated-balance";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

type RFIDBalance = {
  cardUid: string;
  balance: number;
  status: string;
  lastTapAt: string | null;
};

type Transaction = {
  _id: string;
  type: "recharge" | "fare";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  note?: string;
  createdAt: string;
};

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function RFIDWalletPage() {
  const {
    wallet,
    isLoading: walletLoading,
    recharge: walletRecharge,
    refreshWallet,
  } = useWallet();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<"all" | "recharge" | "fare">("all");

  // Recharge modal
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number | "">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentState, setPaymentState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Use wallet provider data
  const balanceData = wallet;

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api<{ data: { items: Transaction[] } }>(
        "/rfid/history?limit=20",
      );
      setTransactions(data.data.items);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchHistory();
      setLoading(false);
    })();
  }, [fetchHistory]);

  const handleRecharge = async () => {
    if (!rechargeAmount || typeof rechargeAmount !== "number") return;
    setPaymentState("loading");

    const success = await walletRecharge(rechargeAmount);
    if (success) {
      setPaymentState("success");
      await fetchHistory();
      toast({
        title: "RFID wallet recharged successfully",
        description: `${rechargeAmount} ETB has been added to your wallet.`,
      });
    } else {
      setPaymentState("error");
      toast({
        title: "Recharge failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectPreset = (amt: number) => {
    setRechargeAmount(amt);
    setCustomAmount("");
  };

  const handleCustomAmount = (val: string) => {
    setCustomAmount(val);
    const n = parseInt(val, 10);
    setRechargeAmount(!isNaN(n) && n >= 10 ? n : "");
  };

  const openRecharge = () => {
    setRechargeAmount(100);
    setCustomAmount("");
    setPaymentState("idle");
    setRechargeOpen(true);
  };

  const filteredTx = transactions.filter(
    (t) => txFilter === "all" || t.type === txFilter,
  );

  // Computed stats
  const totalRecharges = transactions
    .filter((t) => t.type === "recharge" && t.status === "success")
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "fare" && t.status === "success")
    .reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold md:text-3xl">RFID Wallet</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage your transit card balance, recharge via Telebirr, and view
              transactions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main Column */}
            <div className="space-y-6">
              {/* ── Wallet Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 text-white shadow-2xl shadow-cyan-500/20">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-80">
                          RFID Transit Card
                        </span>
                      </div>
                      <Badge
                        className={`border-0 text-[10px] ${balanceData?.status === "active" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-200"}`}
                      >
                        {balanceData?.status || "loading"}
                      </Badge>
                    </div>
                    <p className="mb-1 font-mono text-lg tracking-widest opacity-80">
                      {balanceData?.cardUid || "----"}
                    </p>
                    <p className="text-4xl font-bold">
                      {balanceData ? (
                        <AnimatedBalance
                          value={balanceData.balance}
                          className="text-white"
                        />
                      ) : (
                        "--"
                      )}
                    </p>
                    {balanceData?.lastTapAt && (
                      <p className="mt-1 text-xs opacity-60">
                        Last used:{" "}
                        {new Date(balanceData.lastTapAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    )}
                    <div className="mt-5 flex gap-3">
                      <Button
                        size="sm"
                        onClick={openRecharge}
                        className="bg-white/20 text-white hover:bg-white/30 border-0 gap-1.5"
                      >
                        <Wallet className="h-3.5 w-3.5" /> Recharge via Telebirr
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          refreshWallet();
                          fetchHistory();
                        }}
                        className="text-white/80 hover:text-white hover:bg-white/10 gap-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Quick Stats ── */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Recharged",
                    value: `${totalRecharges.toLocaleString()} ETB`,
                    icon: ArrowUpRight,
                    color: "from-emerald-500 to-teal-500",
                  },
                  {
                    label: "Total Spent",
                    value: `${totalSpent.toLocaleString()} ETB`,
                    icon: ArrowDownLeft,
                    color: "from-rose-500 to-pink-500",
                  },
                  {
                    label: "Transactions",
                    value: String(transactions.length),
                    icon: TrendingUp,
                    color: "from-violet-500 to-purple-500",
                  },
                ].map((s) => (
                  <Card
                    key={s.label}
                    className="transition-all duration-300 hover:scale-[1.02]"
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}
                      >
                        <s.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[10px] text-[var(--muted)]">
                          {s.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ── Transaction History ── */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-[var(--primary)]" />
                      <h2 className="font-semibold">Transaction History</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      {(["all", "recharge", "fare"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setTxFilter(f)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                            txFilter === f
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : "text-[var(--muted)] hover:bg-white/5"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTx.length === 0 ? (
                    <div className="py-10 text-center text-sm text-[var(--muted)]">
                      No transactions found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTx.map((tx) => (
                        <div
                          key={tx._id}
                          className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 transition-colors hover:bg-white/3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                tx.type === "recharge"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-rose-500/15 text-rose-500"
                              }`}
                            >
                              {tx.type === "recharge" ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {tx.type === "recharge"
                                  ? "Recharge"
                                  : "Fare Payment"}
                              </p>
                              <p className="text-[10px] text-[var(--muted)]">
                                {tx.note ||
                                  (tx.type === "recharge"
                                    ? "Telebirr top-up"
                                    : "Transit fare")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${tx.type === "recharge" ? "text-emerald-500" : "text-rose-400"}`}
                            >
                              {tx.type === "recharge" ? "+" : "-"}
                              {tx.amount} ETB
                            </p>
                            <p className="text-[10px] text-[var(--muted)]">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              {/* Quick Recharge */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[var(--primary)]" /> Quick
                    Recharge
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRechargeAmount(amt);
                          setCustomAmount("");
                          setPaymentState("idle");
                          setRechargeOpen(true);
                        }}
                        className="font-semibold"
                      >
                        {amt} ETB
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Balance Breakdown */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--primary)]" />{" "}
                    Spending Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">
                        Current Balance
                      </span>
                      <span className="font-bold">
                        {balanceData?.balance.toLocaleString() || 0} ETB
                      </span>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">
                        Total Recharged
                      </span>
                      <span className="font-bold text-emerald-500">
                        +{totalRecharges.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">Total Spent</span>
                      <span className="font-bold text-rose-400">
                        -{totalSpent.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">Transactions</span>
                      <span className="font-bold">{transactions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Status */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[var(--primary)]" />{" "}
                    Card Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Card ID</span>
                      <span className="font-mono font-bold">
                        {balanceData?.cardUid || "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Status</span>
                      <Badge
                        variant={
                          balanceData?.status === "active"
                            ? "success"
                            : "danger"
                        }
                        className="capitalize text-[10px]"
                      >
                        {balanceData?.status || "unknown"}
                      </Badge>
                    </div>
                    {balanceData?.lastTapAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Last Used</span>
                        <span className="text-xs">
                          {new Date(balanceData.lastTapAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* ── Recharge Modal ── */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-md border-[var(--border)] bg-[var(--background)] p-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {paymentState === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <h3 className="mb-1 text-xl font-bold">Recharge Successful!</h3>
                <p className="mb-6 text-sm text-[var(--muted)]">
                  {rechargeAmount} ETB added to {balanceData?.cardUid}
                </p>
                <div className="mb-6 w-full rounded-2xl border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">New Balance</span>
                    <span className="text-lg font-bold text-emerald-500">
                      {balanceData?.balance.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setRechargeOpen(false);
                    setPaymentState("idle");
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader className="border-b border-[var(--border)] px-6 py-4">
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5 text-[var(--primary)]" />
                    Recharge RFID Wallet
                  </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                  {/* Card Info */}
                  {balanceData && (
                    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold font-mono">
                          {balanceData.cardUid}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          RFID Transit Card
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--muted)]">Balance</p>
                        <p className="text-lg font-bold">
                          {balanceData.balance.toLocaleString()}{" "}
                          <span className="text-xs text-[var(--muted)]">
                            ETB
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amount Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => selectPreset(amt)}
                          className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                            rechargeAmount === amt && !customAmount
                              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-white/5"
                          }`}
                        >
                          {amt} ETB
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Or enter custom amount
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={10}
                        max={10000}
                        placeholder="Enter amount (10 - 10,000)"
                        value={customAmount}
                        onChange={(e) => handleCustomAmount(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--muted)]">
                        ETB
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-[#0BAF4B] text-white hover:bg-[#099A40] disabled:opacity-50"
                    disabled={!rechargeAmount || paymentState === "loading"}
                    onClick={handleRecharge}
                  >
                    {paymentState === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-[9px] font-bold">
                          T
                        </span>
                        Pay {rechargeAmount ? `${rechargeAmount} ETB` : ""} with
                        Telebirr
                      </>
                    )}
                  </Button>

                  <p className="text-center text-[10px] text-[var(--muted)]">
                    Secure payment powered by Telebirr · Ethio Telecom
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
