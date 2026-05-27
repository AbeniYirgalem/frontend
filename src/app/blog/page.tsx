import { BlogSection } from "@/components/marketing/blog";

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <BlogSection />
      </main>
    </div>
  );
}
