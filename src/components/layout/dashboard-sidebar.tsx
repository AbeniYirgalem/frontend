"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const passengerLinks = [
  { href: "/dashboard/passenger", label: "Overview" },
  { href: "/my-trips", label: "My Trips" },
  { href: "/book-trip", label: "Book a Trip" },
  { href: "/rfid-wallet", label: "RFID Wallet" },
];

const operatorLinks = [
  { href: "/dashboard/operator", label: "Fleet" },
  { href: "/rfid-management", label: "RFID Analytics" },
  { href: "/rfid-scanner", label: "RFID Scanner" },
  { href: "/system-monitoring", label: "System Monitoring" },
  { href: "/dashboard/esp32", label: "⚡ ESP32 Telemetry" },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Analytics" },
  { href: "/dashboard/admin", label: "Users" },
  { href: "/dashboard/admin", label: "Approvals" },
  { href: "/rfid-management", label: "RFID Analytics" },
  { href: "/system-monitoring", label: "System Monitoring" },
  { href: "/dashboard/esp32", label: "⚡ ESP32 Telemetry" },
];

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const role = user?.role || "passenger";

  // Determine which link groups to show based on role
  const sections: { title: string; links: typeof passengerLinks }[] = [];

  if (role === "passenger") {
    sections.push({ title: "Passenger", links: passengerLinks });
  } else if (role === "operator") {
    sections.push({ title: "Operator", links: operatorLinks });
    sections.push({ title: "Passenger", links: passengerLinks });
  } else if (role === "admin") {
    sections.push({ title: "Admin", links: adminLinks });
    sections.push({ title: "Operator", links: operatorLinks });
    sections.push({ title: "Passenger", links: passengerLinks });
  }

  return (
    <aside className="hidden w-64 flex-col gap-6 border-r border-white/10 bg-black/5 px-6 py-8 lg:flex">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Control center
        </p>
        <h3 className="text-xl font-semibold">Dashboard</h3>
        <Badge variant="success">Live</Badge>
        {user && (
          <p className="mt-2 text-xs text-muted capitalize">
            Role: <span className="text-[var(--foreground)] font-medium">{role}</span>
          </p>
        )}
      </div>
      <div className="space-y-4 text-sm text-muted">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="font-semibold text-[var(--foreground)]">{section.title}</p>
            {section.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "block rounded-lg px-2 py-1 transition-colors",
                  pathname === link.href
                    ? "text-[var(--primary)] bg-[var(--primary)]/5"
                    : "hover:text-[var(--foreground)] hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
