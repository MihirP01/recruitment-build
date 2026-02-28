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
    <div className={mergeClassNames("w-full", className)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
        <div className="min-w-0">
          <div className="relative min-h-[264px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 md:p-6">
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
                  className="absolute inset-0 p-5 md:p-6"
                >
                  <FeatureCopy feature={current} />
                </motion.article>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2" role="tablist" aria-label="Feature slides">
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
          <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 sm:min-h-[360px]">
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
                  className="absolute inset-0 p-3"
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
    <div className="flex h-full flex-col">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{feature.category}</p>
      <h2 className="mt-3 max-w-[560px] text-2xl font-semibold leading-tight text-[var(--color-text-primary)] md:text-3xl">
        {feature.title}
      </h2>
      <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
        {feature.detail}
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {feature.summary.map((item) => (
          <div
            key={item}
            className="rounded-md border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureScreenshot({ feature }: { feature: FeatureSlide }) {
  return (
    <div className="relative h-full min-h-[276px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <Image
        src={feature.screenshot}
        alt={`${feature.title} preview`}
        fill
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover object-center opacity-[0.18] saturate-50"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.7)_42%,rgba(2,6,23,0.9)_100%)]" />

      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">System Preview</span>
          </div>
          <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
            Linked
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Feature Focus</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">{feature.title}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {feature.summary.slice(0, 2).map((item) => (
              <div
                key={item}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 backdrop-blur-sm">
          <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2">
              <div className="h-2 w-20 rounded-full bg-[rgb(var(--color-accent-rgb)/0.28)]" />
              <div className="h-2 w-full rounded-full bg-[rgb(var(--color-accent-rgb)/0.12)]" />
              <div className="h-2 w-4/5 rounded-full bg-[rgb(var(--color-accent-rgb)/0.18)]" />
              <div className="h-2 w-3/5 rounded-full bg-[rgb(var(--color-accent-rgb)/0.1)]" />
            </div>
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3">
              <div className="flex h-full items-end gap-1.5">
                {[38, 56, 44, 72, 60].map((height, chartIndex) => (
                  <div
                    key={`${feature.title}-${height}-${chartIndex}`}
                    className="flex-1 rounded-t-sm bg-[rgb(var(--color-accent-rgb)/0.24)]"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
