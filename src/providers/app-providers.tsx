"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { WalletProvider } from "@/providers/wallet-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
