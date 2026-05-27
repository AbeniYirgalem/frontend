"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { containerStagger, fadeUp, fadeUpSoft } from "@/lib/motion";

const destinations = [
  {
    city: "Addis Ababa",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1600&auto=format&fit=crop",
  },
  {
    city: "Adama",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop",
  },
  {
    city: "Hawassa",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  },
  {
    city: "Bahir Dar",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop",
  },
];

export function MinimalDestinations() {
  return (
    <section className="bg-background py-16 text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Popular destinations
          </h2>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            Visual picks
          </span>
        </motion.div>
        <motion.div
          className="mt-8 grid gap-5 md:grid-cols-4"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {destinations.map((destination) => (
            <motion.div
              key={destination.city}
              className="group relative h-52 overflow-hidden rounded-2xl"
              variants={fadeUpSoft}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={destination.image}
                  alt={destination.city}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-semibold text-white drop-shadow">
                    {destination.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
