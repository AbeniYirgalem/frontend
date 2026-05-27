import { api } from "@/services/api";
import type { UserRole } from "@/types";

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  isVerified?: boolean;
};

export async function login(payload: { email: string; password: string }) {
  const data = await api<{ data: { token: string; user: AuthUser } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return data.data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}) {
  const data = await api<{ data: { id: string } }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function verifyEmail(token: string) {
  const data = await api<{ data: { verified: boolean } }>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  return data.data;
}

export async function resendVerificationEmail(email: string) {
  const data = await api<{ data: { verified: boolean } }>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
  return data.data;
}
