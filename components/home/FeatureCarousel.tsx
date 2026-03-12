"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type FeatureSlide = {
  title: string;
  category: string;
  detail: string;
  screenshot: string;
  summary: string[];
};

type FeatureCarouselProps = {
  features: FeatureSlide[];
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
    <div
      className={mergeClassNames(
        "relative overflow-hidden rounded-[30px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(135deg,rgb(var(--color-accent-rgb)/0.04)_0%,var(--color-surface-2)_42%,rgb(var(--color-accent-rgb)/0.02)_100%)] px-5 py-6 md:px-7 md:py-7",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[rgb(var(--color-accent-rgb)/0.38)] to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[rgb(var(--color-accent-rgb)/0.22)] to-transparent"
      />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center">
        <div className="min-w-0">
          <div className="min-h-[240px] p-1">
            {reducedMotion ? (
              <article className="h-full">
                <FeatureCopy feature={current} />
              </article>
            ) : (
              <AnimatePresence initial={false} mode="wait">
                <motion.article
                  key={`feature-copy-${current.title}-${index}`}
                  initial={{ opacity: 0, x: direction > 0 ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -12 : 12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-1"
                >
                  <FeatureCopy feature={current} />
                </motion.article>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="Feature slides">
            {features.map((feature, dotIndex) => (
              <button
                key={`${feature.title}-${dotIndex}`}
                type="button"
                role="tab"
                aria-label={`Go to feature ${dotIndex + 1}`}
                aria-selected={dotIndex === index}
                onClick={() => goTo(dotIndex)}
                className={`h-2.5 w-2.5 rounded-full border transition-colors duration-200 ${
                  dotIndex === index
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    : "border-[var(--color-border-strong)] bg-transparent hover:border-[rgb(var(--color-accent-rgb)/0.55)]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.04)] p-4 sm:min-h-[420px]">
            {reducedMotion ? (
              <FeatureScreenshot feature={current} />
            ) : (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={`feature-shot-${current.title}-${index}`}
                  initial={{ opacity: 0, x: direction > 0 ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -10 : 10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 p-4"
                >
                  <FeatureScreenshot feature={current} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCopy({ feature }: { feature: FeatureSlide }) {
  return (
    <div className="flex h-full flex-col justify-center py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{feature.category}</p>
      <h2 className="mt-3 max-w-[520px] text-[1.9rem] font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-[2.55rem]">
        {feature.title}
      </h2>
      <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
        {feature.detail}
      </p>
      <div className="mt-6 space-y-3">
        {feature.summary.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 border-b border-[var(--color-border)] pb-3 text-sm text-[var(--color-text-secondary)] last:border-b-0 last:pb-0"
          >
            <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureScreenshot({ feature }: { feature: FeatureSlide }) {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
      <Image
        src={feature.screenshot}
        alt={`${feature.title} preview`}
        fill
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover object-center opacity-[0.3] saturate-75"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.68)_48%,rgba(2,6,23,0.9)_100%)]" />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mt-auto max-w-[74%] rounded-[20px] border border-[var(--color-border)] bg-[rgb(2,6,23,0.46)] p-5 backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{feature.category}</p>
          <p className="mt-3 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">{feature.title}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {feature.summary.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
