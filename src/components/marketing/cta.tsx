import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CTASection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <Card className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-semibold">Ready to board?</h3>
            <p className="text-sm text-muted">
              Launch routes, manage passengers, and delight riders with modern
              booking tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Create account</Button>
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
