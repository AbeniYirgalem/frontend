import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { BookingTable } from "@/components/dashboard/booking-table";

export default function OperatorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Fleet utilization"
          value="86%"
          trend="+4% vs last week"
        />
        <StatsCard label="Monthly revenue" value="$82,400" trend="+12%" />
        <StatsCard label="Routes live" value="38" trend="3 pending approval" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <RevenueChart />
        <BookingTable />
      </div>
    </div>
  );
}
