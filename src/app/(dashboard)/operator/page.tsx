"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card } from "@/components/ui/card";
import { fetchOperatorOverview } from "@/services/operator-analytics-service";

function formatCurrency(value: number) {
  return (
    new Intl.NumberFormat("en-ET", {
      maximumFractionDigits: 0,
    }).format(value) + " ETB"
  );
}

export default function OperatorDashboardPage() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [windowMinutes, setWindowMinutes] = useState(15);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        const data = await fetchOperatorOverview();
        if (!active) return;
        setActiveUsers(data.activeUsers);
        setTotalRevenue(data.totalRevenue);
        setWindowMinutes(data.activeWindowMinutes);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load operator overview",
          );
        }
      }
    }

    loadOverview();
    const timer = window.setInterval(loadOverview, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="border-rose-500/40 text-sm text-rose-200">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          label="Active users"
          value={activeUsers === null ? "..." : String(activeUsers)}
          trend={`Last ${windowMinutes} min`}
        />
        <StatsCard
          label="Total revenue"
          value={totalRevenue === null ? "..." : formatCurrency(totalRevenue)}
          trend="All-time"
        />
      </div>
    </div>
  );
}
