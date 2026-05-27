"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchForm } from "@/components/bus/search-form";
import { BusCard } from "@/components/bus/bus-card";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchBuses } from "@/services/bus-service";
import { searchSchedules } from "@/services/schedule-service";
import type { Bus } from "@/types";
import type { BackendSchedule } from "@/types/api";

export default function SearchPage() {
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBuses()
      .then((data) => {
        if (!mounted) return;
        const mapped = data.map((bus) => ({
          id: bus._id,
          name: bus.name,
          company: "Operator",
          type: bus.type,
          departureCity: "",
          destinationCity: "",
          departureTime: "",
          arrivalTime: "",
          duration: "",
          price: 0,
          rating: 4.7,
          seatsAvailable: bus.totalSeats,
          amenities: bus.amenities as Bus["amenities"],
          image:
            bus.images?.[0] ||
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
        }));
        setResults(mapped);  // Show only real buses, or empty []
      })
      .catch(() => {
        setResults([]);  // Real API failure → empty, never fake data
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async (values: {
    from: string;
    to: string;
    date: string;
  }) => {
    setLoading(true);
    try {
      const schedules = await searchSchedules(values);
      const filtered = schedules.filter(
        (schedule) => schedule.routeId && schedule.busId,
      );
      const mapped = filtered.map((schedule) => mapScheduleToBus(schedule));
      setResults(mapped);  // Empty [] if no real results — never fake
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const resultCount = useMemo(() => results.length, [results]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10 md:px-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Search buses</h1>
          <SearchForm compact onSearch={handleSearch} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs defaultValue="best">
            <TabsList>
              <TabsTrigger value="best">Best match</TabsTrigger>
              <TabsTrigger value="fast">Fastest</TabsTrigger>
              <TabsTrigger value="cheap">Lowest price</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-sm text-muted">
            {loading ? "Loading results..." : `${resultCount} results found`}
          </p>
        </div>
        <div className="grid gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">No buses found</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Try adjusting your search, or check back later when routes are added.
              </p>
            </div>
          ) : (
            results.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))
          )}
        </div>
        {results.length > 0 && (
          <Pagination page={page} totalPages={3} onPageChange={setPage} />
        )}
      </main>
    </div>
  );
}

function mapScheduleToBus(schedule: BackendSchedule): Bus {
  const route = schedule.routeId;
  const bus = schedule.busId;
  const depart = new Date(schedule.departureTime);
  const arrive = new Date(schedule.arrivalTime);
  const durationMinutes = Math.max(
    0,
    (arrive.getTime() - depart.getTime()) / 60000,
  );
  const durationHours = Math.floor(durationMinutes / 60);
  const durationRemaining = Math.round(durationMinutes % 60);
  const duration = durationMinutes
    ? `${durationHours}h ${durationRemaining}m`
    : "";

  return {
    id: schedule._id,
    name: bus?.name || "Bus",
    company: "Operator",
    type: bus?.type || "Standard",
    departureCity: route?.from || "",
    destinationCity: route?.to || "",
    departureTime: depart.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    arrivalTime: arrive.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration,
    price: schedule.price,
    rating: 4.7,
    seatsAvailable: schedule.availableSeats,
    amenities: (bus?.amenities || []) as Bus["amenities"],
    image:
      bus?.images?.[0] ||
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
  };
}
