"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { fadeIn, scaleIn } from "@/lib/motion";

export function CtaBanner() {
  const router = useRouter();

  const handleBookNow = () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      toast.error("Please login or create an account to continue booking.");
      router.push("/auth/login");
      return;
    }
    router.push("/booking");
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0">
        <Image
          src="/assets/banner6.jpg"
          alt="Ready to travel"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <motion.div
        className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 text-center text-white"
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          className="text-4xl font-semibold drop-shadow-lg sm:text-5xl"
          variants={scaleIn}
        >
          Ready to Travel?
        </motion.h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button size="lg" onClick={handleBookNow}>
            Book Now
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
