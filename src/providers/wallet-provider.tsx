"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/services/api";

export type WalletData = {
  cardUid: string;
  balance: number;
  status: string;
  lastTapAt: string | null;
};

type WalletContextValue = {
  wallet: WalletData | null;
  isLoading: boolean;
  /** Refresh wallet data from server */
  refreshWallet: () => Promise<void>;
  /** Optimistically update balance (for instant UI) then confirm with server */
  recharge: (amount: number) => Promise<boolean>;
  /** Deduct fare — returns false if insufficient */
  deductFare: (fare: number) => Promise<boolean>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    if (!user || user.role !== "passenger") {
      setWallet(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api<{ data: WalletData }>("/rfid/balance");
      setWallet(data.data ?? null);
    } catch {
      /* keep previous state */
    }
    setIsLoading(false);
  }, [user]);

  // Auto-fetch on login / role change
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const recharge = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!wallet) return false;

      // Optimistic update
      const previousBalance = wallet.balance;
      setWallet((prev) =>
        prev ? { ...prev, balance: prev.balance + amount } : prev,
      );

      try {
        await api<{ data: { card: WalletData } }>("/rfid/recharge", {
          method: "POST",
          body: JSON.stringify({ amount }),
        });

        // Confirm with server balance
        await refreshWallet();
        return true;
      } catch {
        // Revert on failure
        setWallet((prev) =>
          prev ? { ...prev, balance: previousBalance } : prev,
        );
        return false;
      }
    },
    [wallet, refreshWallet],
  );

  const deductFare = useCallback(
    async (fare: number): Promise<boolean> => {
      if (!wallet) return false;
      if (wallet.balance < fare) return false;

      // Optimistic update
      const previousBalance = wallet.balance;
      setWallet((prev) =>
        prev ? { ...prev, balance: prev.balance - fare } : prev,
      );

      try {
        // The booking endpoint handles deduction server-side
        // We just update locally; the caller handles the API call
        return true;
      } catch {
        setWallet((prev) =>
          prev ? { ...prev, balance: previousBalance } : prev,
        );
        return false;
      }
    },
    [wallet],
  );

  const value = useMemo(
    () => ({ wallet, isLoading, refreshWallet, recharge, deductFare }),
    [wallet, isLoading, refreshWallet, recharge, deductFare],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
