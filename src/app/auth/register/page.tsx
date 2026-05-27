"use client";

import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { registerSchema } from "@/validations/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { register as registerUser } from "@/services/auth-service";
import { useRouter } from "next/navigation";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "passenger" },
  });
  const submitLockRef = useRef(false);

  const onSubmit = async (values: RegisterValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      await registerUser(values);
      toast.success("Check your email to verify your account.");
      router.push(
        `/auth/verify-email/resend?email=${encodeURIComponent(values.email)}`,
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Create account
          </p>
          <h1 className="text-2xl font-semibold">Join the platform</h1>
          <p className="text-sm text-muted">
            Start booking or manage your fleet in minutes.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              placeholder="Jane Doe"
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-rose-400">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@company.com"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-rose-400">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-rose-400">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
              disabled={isSubmitting}
              {...register("role")}
            >
              <option value="passenger">Passenger</option>
              <option value="operator">Bus operator</option>
            </select>
            {errors.role ? (
              <p className="text-xs text-rose-400">{errors.role.message}</p>
            ) : null}
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <div className="text-sm text-muted">
          Already have an account? <Link href="/auth/login">Log in</Link>
        </div>
      </Card>
    </div>
  );
}
