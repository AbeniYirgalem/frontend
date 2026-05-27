"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchBusById } from "@/services/bus-service";
import type { Bus } from "@/types";
import toast from "react-hot-toast";

export default function BusDetailsPage() {
  const params = useParams<{ busId: string }>();
  const router = useRouter();
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.busId) return;
    fetchBusById(params.busId)
      .then((data) => {
        if (!data) { setNotFound(true); return; }
        setBus({
          id: data._id,
          name: data.name,
          company: "Operator",
          type: data.type,
          departureCity: "",
          destinationCity: "",
          departureTime: "",
          arrivalTime: "",
          duration: "",
          price: 0,
          rating: 4.7,
          seatsAvailable: data.totalSeats,
          amenities: data.amenities as Bus["amenities"],
          image:
            data.images?.[0] ||
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.busId]);

  const handleBook = () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Please login or create an account to continue booking.");
      router.push("/auth/login");
      return;
    }
    router.push("/book-trip");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (notFound || !bus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">Bus not found</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            This bus may no longer be in service.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              Bus details
            </p>
            <h1 className="text-3xl font-semibold">{bus.name}</h1>
            <p className="text-sm text-muted">
              {bus.company} · {bus.type}
            </p>
            <div className="flex flex-wrap gap-2">
              {bus.amenities.map((amenity) => (
                <Badge key={amenity} variant="default">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold">Next schedule</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Seats available</span>
              <span>{bus.seatsAvailable}</span>
            </div>
            <Button onClick={handleBook}>Book this bus</Button>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold">Route details</h3>
            <p className="text-sm text-muted">
              {bus.departureCity && bus.destinationCity
                ? `${bus.departureCity} to ${bus.destinationCity} with express stopovers.`
                : "Route details will appear once a schedule is assigned."}
            </p>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold">Reviews</h3>
            <p className="text-sm text-muted">
              {bus.rating} average rating from verified riders.
            </p>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold">Seat availability</h3>
            <p className="text-sm text-muted">
              {bus.seatsAvailable} seats left
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
