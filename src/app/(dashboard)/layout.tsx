"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Redirect to the correct role-based dashboard
    if (!isLoading && user) {
      const path = window.location.pathname;
      if (path === "/dashboard") {
        // Auto-redirect to the correct role dashboard
        if (user.role === "admin") router.replace("/dashboard/admin");
        else if (user.role === "operator") router.replace("/dashboard/operator");
        else router.replace("/dashboard/passenger");
      }
      // Block passengers from accessing operator/admin dashboards
      if (user.role === "passenger" && (path.includes("/dashboard/operator") || path.includes("/dashboard/admin"))) {
        router.replace("/dashboard/passenger");
      }
      // Block operators from accessing admin dashboard
      if (user.role === "operator" && path.includes("/dashboard/admin")) {
        router.replace("/dashboard/operator");
      }
    }
  }, [router, user, isLoading]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 px-4 py-8 md:px-8">
          <DashboardHeader />
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
