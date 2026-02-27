"use client";

import { ReactNode, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type CinematicSectionProps = {
  id: string;
  tone: "0" | "1" | "2" | "3";
  isHero?: boolean;
  children: ReactNode;
};

const TRANSITION = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1]
} as const;

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "a,button,input,textarea,select,option,label,summary,details,[role='button'],[data-panel-nav-ignore='true']"
    )
  );
}

function isTouchInputDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(any-pointer: coarse)").matches ||
    "ontouchstart" in window
  );
}

export default function CinematicSection({ id, tone, isHero = false, children }: CinematicSectionProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const touchInputRef = useRef<boolean | null>(null);

  if (typeof document !== "undefined" && !scrollContainerRef.current) {
    scrollContainerRef.current = document.getElementById("app-scroll");
  }

  if (touchInputRef.current === null) {
    touchInputRef.current = isTouchInputDevice();
  }

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.28, 0.5, 0.72, 1], [0.45, 0.72, 1, 0.72, 0.45]);
  const scale = useTransform(scrollYProgress, [0, 0.28, 0.5, 0.72, 1], [0.98, 0.992, 1, 0.992, 0.98]);
  const blurPx = useTransform(scrollYProgress, [0, 0.28, 0.5, 0.72, 1], [4, 2, 0, 2, 4]);
  const filter = useTransform(blurPx, (value) => `blur(${value.toFixed(2)}px)`);

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      data-tone={tone}
      data-panel="true"
      onClick={(event) => {
        if (touchInputRef.current) {
          return;
        }

        if (isInteractiveTarget(event.target)) {
          return;
        }

        const section = sectionRef.current;
        if (!section || section.dataset.panelActive === "true") {
          return;
        }

        if (typeof window !== "undefined" && window.getSelection()?.toString()) {
          return;
        }

        section.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }}
      initial={false}
      style={
        reducedMotion
          ? undefined
          : {
              opacity,
              scale,
              filter
            }
      }
      transition={TRANSITION}
      className={`h-[calc(100svh-var(--nav-h))] min-h-[calc(100svh-var(--nav-h))] snap-start border-b border-white/10 bg-[var(--surface-tone)] will-change-transform cursor-pointer [&[data-panel-active='true']]:cursor-default ${
        isHero ? "relative overflow-hidden" : "relative"
      }`}
    >
      {children}
    </motion.section>
  );
}
