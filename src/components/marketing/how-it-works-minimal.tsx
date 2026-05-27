"use client";

import { Armchair, Search, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { containerStagger, fadeUpSoft } from "@/lib/motion";

const steps = [
  { label: "Search", icon: Search },
  { label: "Select Seat", icon: Armchair },
  { label: "Travel", icon: Ticket },
];

export function HowItWorksMinimal() {
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
            How it works
          </h2>
        </motion.div>
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.label}
              className="rounded-2xl border border-border bg-background/60 p-6 text-center shadow-soft"
              variants={fadeUpSoft}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <step.icon className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-semibold">{step.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
