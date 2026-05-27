"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "Amina T.", quote: "Very smooth booking experience." },
  { name: "Samuel K.", quote: "Seats updated instantly. Loved it." },
  { name: "Liya M.", quote: "Clean UI and fast checkout." },
];

export function TestimonialsMinimal() {
  return (
    <section className="bg-muted/20 py-16 text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What riders say
          </h2>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              className="rounded-2xl border border-border bg-background/60 p-6"
              custom={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              whileHover={{ y: -4 }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {item.name[0]}
              </div>
              <p className="text-sm text-muted-foreground">"{item.quote}"</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted">
                {item.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
