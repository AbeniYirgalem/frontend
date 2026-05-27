"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
});

type ForgotValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: ForgotValues) => {
    toast.success(`Password reset link sent to ${values.email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Reset password
          </p>
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>
          <p className="text-sm text-muted">
            We will email you a secure reset link.
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
            {errors.email ? (
              <p className="text-xs text-rose-400">{errors.email.message}</p>
            ) : null}
          </div>
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
      </Card>
    </div>
  );
}
