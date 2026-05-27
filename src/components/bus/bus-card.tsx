"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Bus } from "@/types";
import { formatCurrency } from "@/utils/format";

export function BusCard({ bus }: { bus: Bus }) {
  const router = useRouter();

  const handleBook = () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Please login or create an account to continue booking.");
      router.push("/auth/login");
      return;
    }
    router.push("/booking");
  };

  return (
    <Card className="flex flex-col gap-5 lg:flex-row lg:items-center">
      <div className="relative h-44 w-full overflow-hidden rounded-2xl lg:h-32 lg:w-56">
        <Image
          src={bus.image}
          alt={bus.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">{bus.name}</h3>
            <p className="text-sm text-muted">
              {bus.company} · {bus.type}
            </p>
          </div>
          <Badge variant="success">{bus.rating} ★</Badge>
        </div>
        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {bus.departureTime}
            </p>
            <p>Depart</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {bus.arrivalTime}
            </p>
            <p>Arrive</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {bus.duration}
            </p>
            <p>Duration</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 lg:items-end">
        <p className="text-2xl font-semibold">{formatCurrency(bus.price)}</p>
        <p className="text-xs text-muted">{bus.seatsAvailable} seats left</p>
        <Button size="sm" onClick={handleBook}>
          Select seats
        </Button>
      </div>
    </Card>
  );
}
