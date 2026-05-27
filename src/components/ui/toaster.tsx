"use client";

import { Toaster as HotToaster } from "react-hot-toast";
import { useThemeContext } from "@/providers/theme-provider";

export function Toaster() {
  const { theme } = useThemeContext();

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#0b1220" : "#ffffff",
          color: theme === "dark" ? "#e8eef7" : "#0b1220",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      }}
    />
  );
}
