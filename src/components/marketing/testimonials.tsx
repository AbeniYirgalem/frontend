import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";
import { testimonials } from "@/constants/mock-data";

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Passengers love us"
          title="Trusted by commuters and operators"
          description="See why teams rely on Bus Ticketing System for daily operations."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="space-y-4">
              <p className="text-sm text-muted">"{testimonial.message}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted">{testimonial.role}</p>
              </div>
              <p className="text-sm font-semibold">{testimonial.rating} ★</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
