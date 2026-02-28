"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

type HeroQuoteRotatorProps = {
  quotes: string[];
  priorityCount?: number;
};

const TYPE_DELAY_MS = 42;
const DELETE_DELAY_MS = 22;
const HOLD_DELAY_MS = 2200;
const TRANSITION_GAP_MS = 180;

type AnimationPhase = "typing" | "holding" | "deleting";

export default function HeroQuoteRotator({ quotes, priorityCount = 5 }: HeroQuoteRotatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeQuotes = useMemo(() => quotes.filter((quote) => quote.trim().length > 0), [quotes]);
  const rotationPool = useMemo(() => {
    if (safeQuotes.length === 0) {
      return [];
    }

    const weightedQuotes = safeQuotes.map((quote, index) => ({
      quote,
      weight: index < priorityCount ? 2 : 1
    }));
    const maxWeight = Math.max(...weightedQuotes.map((entry) => entry.weight));
    const orderedPool: string[] = [];

    for (let pass = 0; pass < maxWeight; pass += 1) {
      weightedQuotes.forEach((entry) => {
        if (entry.weight > pass) {
          orderedPool.push(entry.quote);
        }
      });
    }

    return orderedPool;
  }, [priorityCount, safeQuotes]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [phase, setPhase] = useState<AnimationPhase>("typing");

  useEffect(() => {
    if (rotationPool.length === 0 || shouldReduceMotion) {
      return;
    }

    const activeQuote = rotationPool[quoteIndex] ?? "";
    let timeoutId: number | undefined;

    if (phase === "typing") {
      if (visibleText.length < activeQuote.length) {
        timeoutId = window.setTimeout(() => {
          setVisibleText(activeQuote.slice(0, visibleText.length + 1));
        }, TYPE_DELAY_MS);
      } else {
        timeoutId = window.setTimeout(() => {
          setPhase("holding");
        }, HOLD_DELAY_MS);
      }
    }

    if (phase === "holding") {
      timeoutId = window.setTimeout(() => {
        setPhase("deleting");
      }, TRANSITION_GAP_MS);
    }

    if (phase === "deleting") {
      if (visibleText.length > 0) {
        timeoutId = window.setTimeout(() => {
          setVisibleText(activeQuote.slice(0, visibleText.length - 1));
        }, DELETE_DELAY_MS);
      } else {
        timeoutId = window.setTimeout(() => {
          setQuoteIndex((current) => (current + 1) % rotationPool.length);
          setPhase("typing");
        }, TRANSITION_GAP_MS);
      }
    }

    return () => {
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [phase, quoteIndex, rotationPool, shouldReduceMotion, visibleText]);

  useEffect(() => {
    if (rotationPool.length === 0) {
      setVisibleText("");
      return;
    }

    if (shouldReduceMotion) {
      setVisibleText(rotationPool[0] ?? "");
      setPhase("holding");
      return;
    }

    setVisibleText("");
    setPhase("typing");
    setQuoteIndex(0);
  }, [rotationPool, shouldReduceMotion]);

  if (rotationPool.length === 0) {
    return null;
  }

  const renderedQuote = shouldReduceMotion ? rotationPool[0] : visibleText;

  return (
    <div className="max-w-5xl rounded-xl border border-[rgb(var(--color-accent-rgb)/0.45)] bg-[rgb(var(--color-accent-rgb)/0.14)] p-5 md:p-6">
      <p className="section-label text-[var(--color-text-subtle)]">Decision Signal</p>
      <blockquote className="mt-3 min-h-[11rem] md:min-h-[13rem] lg:min-h-[14rem]">
        <p className="max-w-4xl text-4xl font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
          &ldquo;{renderedQuote}
          {!shouldReduceMotion ? (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] rounded-full bg-[var(--color-accent)] align-baseline motion-safe:animate-pulse"
            />
          ) : null}
          &rdquo;
        </p>
      </blockquote>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
        CTRL frames recruitment as a controlled intelligence process, with auditable inputs and decision-ready outcomes.
      </p>
    </div>
  );
}
