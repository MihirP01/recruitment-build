"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Feature = {
  title: string;
  detail: string;
};

type FeatureCarouselProps = {
  features: Feature[];
  className?: string;
  intervalMs?: number;
};

function wrapIndex(next: number, total: number): number {
  if (total === 0) return 0;
  return (next + total) % total;
}

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export default function FeatureCarousel({
  features,
  className,
  intervalMs = 6000
}: FeatureCarouselProps) {
  const reducedMotion = useReducedMotion();
  const total = features.length;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (reducedMotion || total <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => wrapIndex(current + 1, total));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, reducedMotion, total]);

  const current = useMemo(() => features[index], [features, index]);

  const goTo = (nextIndex: number) => {
    if (nextIndex === index) return;

    const forwardDistance = wrapIndex(nextIndex - index, total);
    const backwardDistance = wrapIndex(index - nextIndex, total);
    setDirection(forwardDistance <= backwardDistance ? 1 : -1);
    setIndex(nextIndex);
  };

  if (!current || total === 0) {
    return null;
  }

  return (
    <div className={mergeClassNames("max-w-[740px]", className)}>
      <div className="relative h-[172px] overflow-hidden rounded-lg border border-white/10 bg-[#0F172A]">
        {reducedMotion ? (
          <article className="h-full p-4">
            <p className="text-sm font-semibold text-[#E5E7EB]">{current.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{current.detail}</p>
          </article>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.article
              key={`${current.title}-${index}`}
              initial={{ opacity: 0, x: direction > 0 ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -12 : 12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 p-4"
            >
              <p className="text-sm font-semibold text-[#E5E7EB]">{current.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{current.detail}</p>
            </motion.article>
          </AnimatePresence>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2" role="tablist" aria-label="Feature slides">
        {features.map((feature, dotIndex) => (
          <button
            key={`${feature.title}-${dotIndex}`}
            type="button"
            role="tab"
            aria-label={`Go to feature ${dotIndex + 1}`}
            aria-selected={dotIndex === index}
            onClick={() => goTo(dotIndex)}
            className={`h-2.5 w-2.5 rounded-full border transition-colors duration-200 ${
              dotIndex === index ? "border-[#8AA4C2] bg-[#8AA4C2]" : "border-white/25 bg-transparent hover:border-white/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
