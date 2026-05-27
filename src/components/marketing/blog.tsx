import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";

const posts = [
  {
    title: "Designing an operator command center",
    excerpt: "How we built a unified view of schedules, seats, and revenue.",
  },
  {
    title: "Passenger experience playbook",
    excerpt: "What commuters expect from modern booking platforms.",
  },
  {
    title: "Optimizing routes with data",
    excerpt: "Track performance metrics to launch new profitable routes.",
  },
];

export function BlogSection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Insights"
          title="Latest from the platform"
          description="News, product updates, and operator success stories."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.title} className="space-y-3">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-muted">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
