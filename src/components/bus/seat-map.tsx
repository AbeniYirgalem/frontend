"use client";

import { cn } from "@/lib/utils";

type Seat = {
  id: string;
  status: "available" | "reserved" | "selected";
};

export function SeatMap({
  seats,
  onSelect,
}: {
  seats: Seat[];
  onSelect: (seatId: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
      {seats.map((seat) => (
        <button
          key={seat.id}
          onClick={() => onSelect(seat.id)}
          className={cn(
            "flex h-12 items-center justify-center rounded-xl text-xs font-semibold",
            seat.status === "available" &&
              "bg-white/10 text-[var(--foreground)]",
            seat.status === "reserved" && "bg-white/5 text-muted line-through",
            seat.status === "selected" && "bg-[var(--primary)] text-white",
          )}
          disabled={seat.status === "reserved"}
        >
          {seat.id}
        </button>
      ))}
    </div>
  );
}
