"use client";

import { Bus, Globe2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { containerStagger, fadeUpSoft } from "@/lib/motion";

const stats = [
  { label: "10,000+ यात्र", value: "10,000+", icon: Users },
  { label: "500+ Buses", value: "500+", icon: Bus },
  { label: "50+ Cities", value: "50+", icon: Globe2 },
];

export function TrustStats() {
  return (
    <section className="bg-background py-16 text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpSoft}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted at scale
          </h2>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-border bg-background/60 p-6 text-center shadow-soft"
              variants={fadeUpSoft}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <stat.icon className="mx-auto mb-4 h-6 w-6 text-muted-foreground" />
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
