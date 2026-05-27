"use client";

import { ShieldCheck, Timer, Ticket, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { containerStagger, fadeUpSoft } from "@/lib/motion";

const items = [
  { label: "Fast Booking", icon: Timer },
  { label: "Secure Tickets", icon: ShieldCheck },
  { label: "Comfort Travel", icon: Ticket },
  { label: "24/7 Support", icon: Headphones },
];

export function WhyChooseMinimal() {
  return (
    <section className="bg-muted/20 py-16 text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpSoft}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why travelers choose us
          </h2>
        </motion.div>
        <motion.div
          className="grid gap-4 md:grid-cols-4"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {items.map((item) => (
            <motion.div
              key={item.label}
              className="rounded-2xl border border-border bg-background/60 p-6 text-center"
              variants={fadeUpSoft}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <motion.div
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </motion.div>
              <p className="text-sm font-semibold">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
