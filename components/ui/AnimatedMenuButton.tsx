"use client";

import { motion } from "framer-motion";

type AnimatedMenuButtonProps = {
  open: boolean;
  onClick: () => void;
  controlsId?: string;
  className?: string;
  size?: "sm" | "md";
  openLabel?: string;
  closedLabel?: string;
};

const ICON_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AnimatedMenuButton({
  open,
  onClick,
  controlsId,
  className = "",
  size = "md",
  openLabel = "Close menu",
  closedLabel = "Open menu"
}: AnimatedMenuButtonProps) {
  const sizeClass = size === "sm" ? "h-10 w-10" : "h-11 w-11";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={open ? openLabel : closedLabel}
      className={`group relative flex ${sizeClass} items-center justify-center rounded-md border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[var(--color-surface-0)] p-0 text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-all duration-200 hover:border-[rgb(var(--color-accent-rgb)/0.7)] hover:bg-[var(--color-surface-1)] active:scale-[0.96] ${className}`}
    >
      <span className="pointer-events-none absolute inset-[2px] rounded-[6px] border border-white/5" />
      <span aria-hidden="true" className="pointer-events-none relative block h-5 w-5">
        <span className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="block h-[2px] w-[18px] -translate-y-[5px] rounded-full bg-current shadow-[0_0_12px_rgba(140,167,203,0.45)]"
            animate={open ? { y: 0, rotate: 45 } : { y: -5, rotate: 0 }}
            transition={{ duration: 0.24, ease: ICON_EASE }}
          />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="block h-[2px] w-[18px] rounded-full bg-current"
            animate={open ? { opacity: 0, scaleX: 0.25 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.18, ease: ICON_EASE }}
          />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="block h-[2px] w-[18px] translate-y-[5px] rounded-full bg-current shadow-[0_0_12px_rgba(140,167,203,0.45)]"
            animate={open ? { y: 0, rotate: -45 } : { y: 5, rotate: 0 }}
            transition={{ duration: 0.24, ease: ICON_EASE }}
          />
        </span>
      </span>
    </motion.button>
  );
}
