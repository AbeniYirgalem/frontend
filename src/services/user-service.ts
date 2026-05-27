import { api } from "@/services/api";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isVerified?: boolean;
};

export async function fetchProfile() {
  const data = await api<{ data: UserProfile }>("/users/me");
  return data.data;
}
