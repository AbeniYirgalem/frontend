import { Card } from "@/components/ui/card";
import type { Ticket } from "@/types";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Ticket
        </p>
        <h3 className="text-xl font-semibold">{ticket.id}</h3>
      </div>
      <div className="space-y-2 text-sm text-muted">
        <p>Passenger: {ticket.passenger}</p>
        <p>Route: {ticket.route}</p>
        <p>Date: {ticket.date}</p>
        <p>Seats: {ticket.seats.join(", ")}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-white/20 p-4 text-center text-xs text-muted">
        QR code placeholder
      </div>
      <p className="text-sm font-semibold">Status: {ticket.status}</p>
    </Card>
  );
}
