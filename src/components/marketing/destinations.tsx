import { destinations } from "@/constants/mock-data";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/section-heading";

export function Destinations() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Popular now"
          title="Popular destinations"
          description="High-demand routes with fast checkouts and verified operators."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <Card key={destination.city} className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{destination.city}</h3>
                <p className="text-sm text-muted">{destination.country}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">From</span>
                <span className="font-semibold">${destination.priceFrom}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Avg duration</span>
                <span>{destination.duration}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
