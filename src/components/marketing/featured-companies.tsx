import { busCompanies } from "@/constants/mock-data";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/section-heading";

export function FeaturedCompanies() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Operator network"
          title="Featured bus companies"
          description="Verified operators with premium amenities, top ratings, and instant ticketing."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {busCompanies.map((company) => (
            <Card key={company.name} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <p className="text-sm text-muted">{company.tagline}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Rating</span>
                <span className="font-semibold">{company.rating} ★</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Active buses</span>
                <span>{company.buses}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
