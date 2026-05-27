"use client";

import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "@/validations/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { login } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });
  const submitLockRef = useRef(false);

  const onSubmit = async (values: LoginValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const result = await login(values);
      window.localStorage.setItem("token", result.token);
      setUser({
        id: result.user.id,
        name: result.user.name || values.email,
        email: result.user.email || values.email,
        role: result.user.role || "passenger",
        isVerified: result.user.isVerified,
      });
      toast.success("Login successful");
      router.push("/");
    } catch (error) {
      const message = (error as Error).message;
      toast.error(message);
      if (message.includes("not verified")) {
        router.push(
          `/auth/verify-email/resend?email=${encodeURIComponent(values.email)}`,
        );
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Sign in
          </p>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted">
            Access bookings, tickets, and dashboards.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-sm">
          <Link className="text-muted" href="/auth/forgot-password">
            Forgot password?
          </Link>
          <Link className="text-muted" href="/auth/register">
            Create account
          </Link>
        </div>
        <div className="text-center text-sm text-muted">
          Email not verified?{" "}
          <Link href="/auth/verify-email/resend">Resend verification</Link>
        </div>
      </Card>
    </div>
  );
}
