"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resendVerificationSchema } from "@/validations/auth";
import { resendVerificationEmail } from "@/services/auth-service";

type ResendValues = z.infer<typeof resendVerificationSchema>;

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState, setValue } = useForm<ResendValues>(
    {
      resolver: zodResolver(resendVerificationSchema),
    },
  );

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setValue("email", email);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (values: ResendValues) => {
    try {
      await resendVerificationEmail(values.email);
      toast.success("Verification email sent. Check your inbox.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Verify account
          </p>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted">
            We sent a verification link to your inbox. If it expired, request a
            new email below.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@company.com"
              {...register("email")}
            />
            {formState.errors.email ? (
              <p className="text-xs text-rose-400">
                {formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={formState.isSubmitting}
          >
            Resend verification email
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={null}>
      <ResendVerificationContent />
    </Suspense>
  );
}
