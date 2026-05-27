import { Card } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-emerald-300">{trend}</p>
    </Card>
  );
}
