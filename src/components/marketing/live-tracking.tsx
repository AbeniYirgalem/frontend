import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";
import { Map, Navigation } from "lucide-react";

export function LiveTracking() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Live tracking"
              title="Follow every bus in motion"
              description="Monitor arrivals, traffic impact, and ETAs across your fleet with a live map."
            />
            <div className="flex items-center gap-4 text-sm text-muted">
              <Navigation className="h-5 w-5 text-[var(--primary)]" />
              Real-time GPS updates
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <Map className="h-5 w-5 text-[var(--accent)]" />
              Predictive arrival intelligence
            </div>
          </div>
          <Card className="h-64">
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Live tracking map placeholder
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
