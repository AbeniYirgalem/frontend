import { Card } from "@/components/ui/card";

export function ChatbotTeaser() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              AI support
            </p>
            <h3 className="text-2xl font-semibold">24/7 trip assistant</h3>
            <p className="text-sm text-muted">
              AI-powered concierge helps riders with booking, refunds, and
              rebooking.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-muted">
            "Hi! I can help you find the next available seat."
          </div>
        </Card>
      </div>
    </section>
  );
}
