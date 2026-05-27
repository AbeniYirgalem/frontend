"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/services/auth-service";
import toast from "react-hot-toast";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/auth/verify-email/invalid?reason=missing");
      return;
    }

    setStatus("loading");
    verifyEmail(token)
      .then(() => {
        router.replace("/auth/verify-email/success");
      })
      .catch((error) => {
        toast.error((error as Error).message);
        router.replace("/auth/verify-email/invalid?reason=expired");
      })
      .finally(() => {
        setStatus("idle");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[var(--primary)]/10 p-4">
          <div className="h-full w-full animate-pulse rounded-full bg-[var(--primary)]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Verifying
          </p>
          <h1 className="text-2xl font-semibold">Confirming your email</h1>
          <p className="text-sm text-muted">
            Please wait while we verify your account.
          </p>
        </div>
        <Button variant="ghost" disabled={status === "loading"}>
          {status === "loading" ? "Verifying..." : "Working"}
        </Button>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
