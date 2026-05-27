"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

let sharedSocket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client connected to the backend.
 * The socket is created once and reused across all components.
 */
export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  if (!sharedSocket) {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    sharedSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:5000",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
        auth: token ? { token } : undefined,
      },
    );
  }

  socketRef.current = sharedSocket;

  return socketRef.current;
}
