type ApiError = {
  message?: string;
};

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("token");
}

export async function api<T>(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const token = getToken();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = (await response.json()) as T & ApiError;
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data as T;
}
