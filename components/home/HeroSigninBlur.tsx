"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useAuthUI } from "@/components/AuthUIProvider";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroSigninBlur() {
  const { isOpen, mode } = useAuthUI();
  const shouldReduceMotion = useReducedMotion();
  const active = isOpen && mode === "signin";

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.36, ease: EASE }}
      className="pointer-events-none absolute inset-0 z-20 bg-[#020617]/30 backdrop-blur-md"
    />
  );
}

