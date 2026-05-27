"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchSchema } from "@/validations/search";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type SearchFormValues = z.infer<typeof searchSchema>;

export function SearchForm({
  compact = false,
  onSearch,
  className,
}: {
  compact?: boolean;
  onSearch?: (values: SearchFormValues) => Promise<void> | void;
  className?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: "Lagos",
      to: "Abuja",
      date: "2026-05-18",
    },
  });

  const onSubmit = async (values: SearchFormValues) => {
    toast.loading("Searching buses...", { id: "search" });
    try {
      await onSearch?.(values);
      toast.success(`Searching buses from ${values.from} to ${values.to}`, {
        id: "search",
      });
    } catch (error) {
      toast.error((error as Error).message, { id: "search" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "grid gap-4 rounded-xl border border-white/20 bg-black/20 p-5 backdrop-blur-md md:grid-cols-4",
        compact && "md:grid-cols-3",
        className,
      )}
    >
      <div className="space-y-2">
        <Label>From</Label>
        <Input placeholder="Departure city" {...register("from")} />
        {errors.from ? (
          <p className="text-xs text-rose-400">{errors.from.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label>To</Label>
        <Input placeholder="Destination city" {...register("to")} />
        {errors.to ? (
          <p className="text-xs text-rose-400">{errors.to.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("date")} />
        {errors.date ? (
          <p className="text-xs text-rose-400">{errors.date.message}</p>
        ) : null}
      </div>
      <div className="flex items-end">
        <Button className="w-full" type="submit">
          Search buses
        </Button>
      </div>
    </form>
  );
}
