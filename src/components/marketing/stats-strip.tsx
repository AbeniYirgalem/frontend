import { Card } from "@/components/ui/card";

const stats = [
  { label: "Daily searches", value: "120k+" },
  { label: "Verified operators", value: "200+" },
  { label: "Avg booking time", value: "45s" },
  { label: "Routes monitored", value: "1.3k" },
];

export function StatsStrip() {
  return (
    <section className="py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <Card className="grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
