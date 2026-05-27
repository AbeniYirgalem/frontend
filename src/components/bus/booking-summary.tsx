import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

export function BookingSummary({
  seats,
  price,
}: {
  seats: string[];
  price: number;
}) {
  const total = seats.length * price;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Seats</span>
          <span>{seats.join(", ") || "None selected"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Price per seat</span>
          <span>{formatCurrency(price)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
