"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/ticket/ticket-card";
import { fetchProfile } from "@/services/user-service";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import type { Ticket } from "@/types";

export default function TicketPage() {
  const router = useRouter();
  const params = useParams<{ ticketId: string }>();
  const warnedRef = useRef(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast.error("Please login to view your ticket.");
      }
      router.replace("/auth/login");
      return;
    }

    // Verify email first
    fetchProfile()
      .then((profile) => {
        if (!profile.isVerified && !warnedRef.current) {
          warnedRef.current = true;
          toast.error("Please verify your email before viewing tickets.");
          router.replace("/auth/verify-email/resend");
          return;
        }

        // Load real booking as ticket
        const bookingId = params.ticketId;
        if (!bookingId) { setError("No ticket ID provided."); setLoading(false); return; }

        api<{ data: {
          _id: string; originStop: string; destinationStop: string;
          fare: number; status: string; bookedAt: string;
          paymentMethod: string;
        } }>(`/trip-bookings/${bookingId}`)
          .then((res) => {
            const b = res.data;
            setTicket({
              id: b._id.slice(-8).toUpperCase(),
              passenger: profile.name,
              route: `${b.originStop} → ${b.destinationStop}`,
              date: new Date(b.bookedAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }),
              seats: ["—"],
              price: b.fare,
                status: b.status === "confirmed" ? "Confirmed"
                  : b.status === "cancelled" ? "Cancelled"
                  : b.status === "completed" ? "Completed"
                  : b.status === "pending" ? "Pending"
                  : "Pending",
            });
          })
          .catch(() => setError("Ticket not found or you don't have access to it."))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        if (!warnedRef.current) {
          warnedRef.current = true;
          toast.error("Please login to view your ticket.");
        }
        router.replace("/auth/login");
      });
  }, [router, params.ticketId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <p className="text-lg font-semibold">{error || "Ticket not found"}</p>
        <p className="text-sm text-[var(--muted)]">
          Only your own booked trips can be viewed here.
        </p>
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => router.push("/my-trips")}
        >
          <ArrowLeft className="h-4 w-4" /> Go to My Trips
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Ticket details
          </p>
          <h1 className="text-3xl font-semibold">Your Booking Ticket</h1>
        </div>
        <TicketCard ticket={ticket} />
        <Button
          variant="ghost"
          className="gap-1"
          onClick={() => router.push("/my-trips")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Button>
      </main>
    </div>
  );
}
