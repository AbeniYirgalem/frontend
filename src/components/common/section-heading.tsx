import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-3", align === "center" && "text-center")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {description ? (
        <p className="text-base text-muted md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
