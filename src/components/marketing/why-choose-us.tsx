import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";
import { BadgeCheck, Clock, MapPinned, Shield } from "lucide-react";

const features = [
  {
    title: "Seat-level availability",
    description: "Real-time seat maps with instant locks and smart grouping.",
    icon: MapPinned,
  },
  {
    title: "Trusted operators",
    description: "Verified bus companies with safety and service checks.",
    icon: Shield,
  },
  {
    title: "Fast rescheduling",
    description: "Swap routes, dates, or seats in a few clicks.",
    icon: Clock,
  },
  {
    title: "Loyalty benefits",
    description: "Earn points, unlock perks, and save on frequent trips.",
    icon: BadgeCheck,
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Why choose us"
          title="Built for premium travel experiences"
          description="Modern SaaS-grade tooling for passengers, operators, and enterprise admins."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-4">
              <feature.icon className="h-6 w-6 text-[var(--primary)]" />
              <div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
