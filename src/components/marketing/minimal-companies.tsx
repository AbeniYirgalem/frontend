const logos = ["SwiftRide", "MetroLink", "Skyline", "Pulse", "Orbit", "Nova"];

export function MinimalCompanies() {
  return (
    <section className="bg-muted/20 py-16 text-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Featured operators
          </h2>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            Trusted
          </span>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex h-14 items-center justify-center rounded-xl border border-border bg-background/60 text-sm text-muted-foreground transition hover:border-foreground/30"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
