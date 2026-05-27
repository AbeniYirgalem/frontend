import { Card } from "@/components/ui/card";

const rows = [
  { route: "Lagos -> Abuja", seats: "A1, A2", status: "Confirmed" },
  { route: "Accra -> Kumasi", seats: "C4", status: "Pending" },
  { route: "Nairobi -> Mombasa", seats: "B6", status: "Confirmed" },
];

export function BookingTable() {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent bookings</h3>
        <div className="space-y-3 text-sm">
          {rows.map((row) => (
            <div
              key={row.route}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{row.route}</p>
                <p className="text-xs text-muted">Seats: {row.seats}</p>
              </div>
              <span className="text-xs text-muted">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
