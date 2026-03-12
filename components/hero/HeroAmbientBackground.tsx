"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type HeroAmbientBackgroundProps = {
  parallax?: boolean;
  className?: string;
};

function mergeClassNames(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function HeroAmbientBackground({ className }: HeroAmbientBackgroundProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    let rafId = 0;
    let currentX = 50;
    let currentY = 34;
    let targetX = 50;
    let targetY = 34;

    const applyCursorPosition = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      root.style.setProperty("--hero-cursor-x", `${currentX}%`);
      root.style.setProperty("--hero-cursor-y", `${currentY}%`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = window.requestAnimationFrame(applyCursorPosition);
      } else {
        rafId = 0;
      }
    };

    const scheduleUpdate = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(applyCursorPosition);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      targetX = Math.min(78, Math.max(22, (event.clientX / width) * 100));
      targetY = Math.min(68, Math.max(18, (event.clientY / height) * 100));
      scheduleUpdate();
    };

    const handlePointerLeave = () => {
      targetX = 50;
      targetY = 34;
      scheduleUpdate();
    };

    root.style.setProperty("--hero-cursor-x", "50%");
    root.style.setProperty("--hero-cursor-y", "34%");

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [shouldReduceMotion]);

  return (
    <div
      ref={rootRef}
      className={mergeClassNames("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
      style={
        {
          "--hero-cursor-x": "50%",
          "--hero-cursor-y": "34%"
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(180deg, rgb(var(--hero-ambient-base-rgb) / 0.18) 0%, rgb(var(--hero-ambient-base-rgb) / 0.32) 46%, rgb(var(--hero-ambient-base-rgb) / 0.42) 100%)",
            "radial-gradient(140% 88% at 50% 18%, rgb(var(--hero-ambient-highlight-rgb) / 0.08) 0%, rgb(var(--hero-ambient-highlight-rgb) / 0.04) 24%, transparent 62%)",
            "radial-gradient(80% 64% at 18% 24%, rgb(var(--hero-ambient-primary-rgb) / 0.12) 0%, rgb(var(--hero-ambient-primary-rgb) / 0.06) 32%, transparent 74%)",
            "radial-gradient(72% 54% at 82% 22%, rgb(var(--hero-ambient-secondary-rgb) / 0.1) 0%, rgb(var(--hero-ambient-secondary-rgb) / 0.05) 28%, transparent 72%)",
            "radial-gradient(76% 68% at 50% 92%, rgb(var(--hero-ambient-tertiary-rgb) / 0.08) 0%, rgb(var(--hero-ambient-tertiary-rgb) / 0.04) 30%, transparent 76%)"
          ].join(", ")
        }}
        aria-hidden="true"
      />

      {!shouldReduceMotion ? (
        <div
          className="absolute inset-[-12%]"
          style={{
            background:
              "radial-gradient(42% 38% at var(--hero-cursor-x) var(--hero-cursor-y), rgb(var(--hero-ambient-highlight-rgb) / 0.14) 0%, rgb(var(--hero-ambient-highlight-rgb) / 0.08) 18%, rgb(var(--hero-ambient-highlight-rgb) / 0.04) 34%, transparent 62%)"
          }}
          aria-hidden="true"
        />
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(90deg, transparent 0%, rgb(var(--hero-ambient-highlight-rgb) / 0.028) 18%, rgb(var(--hero-ambient-highlight-rgb) / 0.04) 50%, rgb(var(--hero-ambient-highlight-rgb) / 0.028) 82%, transparent 100%)",
            "repeating-linear-gradient(90deg, transparent 0, transparent 118px, rgb(var(--hero-ambient-highlight-rgb) / 0.018) 119px, transparent 120px)"
          ].join(", "),
          maskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.88) 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.88) 82%, transparent 100%)"
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(var(--hero-overlay-rgb) / var(--hero-overlay-base-alpha))" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-core-alpha)) 0%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-mid-alpha)) 72%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-edge-alpha)) 100%)"
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--hero-overlay-rgb) / 0.08) 0%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-bottom-alpha)) 100%)"
        }}
        aria-hidden="true"
      />
    </div>
  );
}
