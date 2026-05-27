import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";

export function LoyaltySection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Loyalty"
          title="Reward every ride"
          description="Passengers earn points on every booking and unlock premium perks."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {["Silver", "Gold", "Platinum"].map((tier) => (
            <Card key={tier} className="space-y-3">
              <h3 className="text-lg font-semibold">{tier} tier</h3>
              <p className="text-sm text-muted">
                Earn exclusive discounts, lounge access, and early seat
                selection.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
