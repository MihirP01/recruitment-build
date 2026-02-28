"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

export type TestimonialReview = {
  quote: string;
  name: string;
  title: string;
  organisation: string;
  rating: number;
};

type TestimonialCarouselProps = {
  testimonials: TestimonialReview[];
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
    <div className={mergeClassNames("max-w-[740px] w-full", className)}>
      <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] md:min-h-[280px]">
        {reducedMotion ? (
          <article className="h-full p-4 md:p-5">
            <TestimonialCardBody testimonial={current} />
          </article>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.article
              key={`${current.name}-${index}`}
              initial={{ opacity: 0, x: direction > 0 ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -12 : 12 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="p-4 md:p-5"
            >
              <TestimonialCardBody testimonial={current} />
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
              dotIndex === index
                ? "border-[rgb(var(--color-accent-rgb)/0.9)] bg-[var(--color-accent)]"
                : "border-[var(--color-border-strong)] bg-transparent hover:border-[rgb(var(--color-accent-rgb)/0.55)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialCardBody({ testimonial }: { testimonial: TestimonialReview }) {
  return (
    <div className="flex h-full min-h-full flex-col">
      <div className="flex items-center gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <Star
            key={`${testimonial.name}-${starIndex}`}
            className="h-4 w-4"
            fill={starIndex < testimonial.rating ? "currentColor" : "transparent"}
          />
        ))}
        <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {testimonial.rating.toFixed(1)} / 5
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-primary)] md:text-[15px]">{testimonial.quote}</p>
      <div className="mt-auto border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
        <p className="font-semibold text-[var(--color-text-secondary)]">{testimonial.name}</p>
        <p className="mt-1">{testimonial.title}</p>
        <p>{testimonial.organisation}</p>
      </div>
    </div>
  );
}
