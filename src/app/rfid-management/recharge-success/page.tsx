"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function RechargeSuccessContent() {
  const params = useSearchParams();
  const card = params.get("card") || "—";
  const amount = params.get("amount") || "0";
  const order = params.get("order") || "—";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="flex flex-col items-center p-8 text-center">
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-2 text-2xl font-bold"
              >
                Recharge Successful!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8 text-sm text-[var(--muted)]"
              >
                Your transit card has been topped up via Telebirr
              </motion.p>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8 w-full space-y-3 rounded-2xl border border-[var(--border)] p-5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Card</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CreditCard className="h-3.5 w-3.5 text-[var(--muted)]" />
                    {card}
                  </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Amount Added</span>
                  <span className="text-lg font-bold text-emerald-500">+{amount} ETB</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Order ID</span>
                  <span className="font-mono text-xs text-[var(--muted)]">{order}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Payment Method</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0BAF4B] text-[9px] font-bold text-white">T</span>
                    Telebirr
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button asChild size="lg">
                  <Link href="/rfid-management">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to RFID Management
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function RechargeSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" /></div>}>
      <RechargeSuccessContent />
    </Suspense>
  );
}
