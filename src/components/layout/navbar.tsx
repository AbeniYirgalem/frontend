"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Activity,
  Clock,
  Map,
  CreditCard,
  Ticket,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type NavLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
};

const allNavLinks: NavLink[] = [
  { href: "/overview", label: "Home", icon: LayoutDashboard },
  {
    href: "/book-trip",
    label: "Book Trip",
    icon: Ticket,
    roles: ["passenger"],
  },
  {
    href: "/my-trips",
    label: "My Trips",
    icon: ClipboardList,
    roles: ["passenger"],
  },
  {
    href: "/rfid-wallet",
    label: "RFID Wallet",
    icon: CreditCard,
    roles: ["passenger"],
  },
  { href: "/live-transit-map", label: "Live Map", icon: Map },
  {
    href: "/system-monitoring",
    label: "Monitoring",
    icon: Activity,
    roles: ["operator", "admin"],
  },
  {
    href: "/rfid-management",
    label: "RFID Analytics",
    icon: CreditCard,
    roles: ["operator", "admin"],
  },
  {
    href: "/rfid-scanner",
    label: "Scanner",
    icon: Activity,
    roles: ["operator", "admin"],
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // Filter nav links based on user role
  const navLinks = useMemo(() => {
    const role = user?.role || "passenger";
    return allNavLinks.filter((link) => {
      if (!link.roles) return true; // No restriction = visible to all
      return link.roles.includes(role);
    });
  }, [user?.role]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* ── Brand ── */}
        <Link href="/overview" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg shadow-[var(--primary)]/20 transition-transform duration-300 group-hover:scale-110">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight hidden sm:inline">
            TransitFlow
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5",
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop Actions ── */}
        <div className="hidden items-center gap-2 lg:flex">
          <NotificationBell />
          <ThemeToggle />
          {!isLoading && user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={logout}>
                Log out
              </Button>
            </>
          ) : null}
          {!isLoading && !user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          ) : null}
        </div>

        {/* ── Mobile Toggle ── */}
        <div className="flex items-center gap-2 lg:hidden">
          <NotificationBell />
          <ThemeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-white/10 pt-3">
                {!isLoading && user ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="justify-start"
                    >
                      Log out
                    </Button>
                  </div>
                ) : null}
                {!isLoading && !user ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link href="/auth/login" onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="justify-start">
                      <Link
                        href="/auth/register"
                        onClick={() => setOpen(false)}
                      >
                        Get started
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
