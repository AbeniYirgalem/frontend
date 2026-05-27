import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Home
        </p>
        <h1 className="text-2xl font-semibold">Dashboard Control Room</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
          <Input className="pl-9" placeholder="Search bookings, routes" />
        </div>
        <Button variant="outline" size="sm">
          <Bell size={16} />
          Alerts
        </Button>
      </div>
    </div>
  );
}
