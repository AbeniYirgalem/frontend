"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedBalanceProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

/**
 * Smoothly animates between balance values using requestAnimationFrame.
 * Shows a brief color flash (green for increase, red for decrease).
 */
export function AnimatedBalance({
  value,
  duration = 600,
  className = "",
  suffix = " ETB",
}: AnimatedBalanceProps) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;

    // Determine direction
    setFlash(value > prev ? "up" : "down");
    const timeout = setTimeout(() => setFlash(null), 800);

    const start = performance.now();
    const diff = value - prev;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + diff * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    prevRef.current = value;

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timeout);
    };
  }, [value, duration]);

  return (
    <span
      className={`transition-colors duration-500 ${
        flash === "up"
          ? "text-emerald-400"
          : flash === "down"
            ? "text-rose-400"
            : ""
      } ${className}`}
    >
      {display.toLocaleString()}{suffix}
    </span>
  );
}
