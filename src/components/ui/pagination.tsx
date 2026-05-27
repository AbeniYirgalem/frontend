import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
      >
        Previous
      </Button>
      {pages.map((value) => (
        <button
          key={value}
          className={cn(
            "h-9 w-9 rounded-full text-sm font-semibold",
            value === page
              ? "bg-[var(--primary)] text-white"
              : "bg-white/10 text-muted",
          )}
          onClick={() => onPageChange(value)}
        >
          {value}
        </button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
      >
        Next
      </Button>
    </div>
  );
}
