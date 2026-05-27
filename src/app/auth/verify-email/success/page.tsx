import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 p-4">
          <div className="h-full w-full animate-pulse rounded-full bg-emerald-500" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Success
          </p>
          <h1 className="text-2xl font-semibold">Email verified</h1>
          <p className="text-sm text-muted">
            Your account is now active. You can book seats and download tickets.
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Continue to login</Link>
        </Button>
      </Card>
    </div>
  );
}
