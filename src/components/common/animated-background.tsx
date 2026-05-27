"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-[var(--primary)]/30 blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--accent)]/25 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
}
