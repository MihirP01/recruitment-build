"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  organisation: string;
};

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
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

export default function TestimonialCarousel({
  testimonials,
  className,
  intervalMs = 6000
}: TestimonialCarouselProps) {
  const reducedMotion = useReducedMotion();
  const total = testimonials.length;
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

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, reducedMotion, total]);

  const current = useMemo(() => testimonials[index], [index, testimonials]);

  const goTo = (nextIndex: number) => {
    if (nextIndex === index) {
      return;
    }

    const forwardDistance = wrapIndex(nextIndex - index, total);
    const backwardDistance = wrapIndex(index - nextIndex, total);
    setDirection(forwardDistance <= backwardDistance ? 1 : -1);
    setIndex(nextIndex);
  };

  if (total === 0 || !current) {
    return null;
  }

  return (
    <div className={mergeClassNames("max-w-[740px]", className)}>
      <div className="relative h-[236px] overflow-hidden rounded-lg border border-white/10 bg-[#0F172A] md:h-[220px]">
        {reducedMotion ? (
          <article className="h-full p-4 md:p-5">
            <p className="text-sm leading-relaxed text-[#E5E7EB]">{current.quote}</p>
            <div className="mt-4 text-xs text-[#9CA3AF]">
              <p className="font-semibold text-[#C3CDDA]">{current.name}</p>
              <p>{current.organisation}</p>
            </div>
          </article>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.article
              key={`${current.name}-${index}`}
              initial={{ opacity: 0, x: direction > 0 ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -12 : 12 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="absolute inset-0 p-4 md:p-5"
            >
              <p className="text-sm leading-relaxed text-[#E5E7EB]">{current.quote}</p>
              <div className="mt-4 text-xs text-[#9CA3AF]">
                <p className="font-semibold text-[#C3CDDA]">{current.name}</p>
                <p>{current.organisation}</p>
              </div>
            </motion.article>
          </AnimatePresence>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((testimonial, dotIndex) => (
            <button
              key={`${testimonial.name}-${dotIndex}`}
              type="button"
              role="tab"
              aria-label={`Go to testimonial ${dotIndex + 1}`}
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
