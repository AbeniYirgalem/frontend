"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SearchForm } from "@/components/bus/search-form";
import { containerStagger, fadeUp, scaleIn } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative h-[70vh] w-full min-h-[60vh]">
      <Image
        src="/assets/banner6.jpg"
        alt="Bus travel"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <motion.div
          className="w-full max-w-2xl space-y-6 text-center"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="text-5xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-6xl"
            variants={fadeUp}
          >
            Travel Smarter
          </motion.h1>
          <motion.p
            className="text-lg text-white/85 drop-shadow"
            variants={fadeUp}
          >
            Book buses in seconds
          </motion.p>
          <motion.div variants={scaleIn}>
            <SearchForm className="bg-transparent text-white shadow-none backdrop-blur-0" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
