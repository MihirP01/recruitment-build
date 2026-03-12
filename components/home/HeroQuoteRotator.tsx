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
  const reserveQuote = useMemo(
    () => safeQuotes.reduce((longest, quote) => (quote.length > longest.length ? quote : longest), safeQuotes[0] ?? ""),
    [safeQuotes]
  );
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
    <div className="max-w-[920px]">
      <div className="relative overflow-hidden rounded-[30px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(135deg,rgb(var(--color-accent-rgb)/0.04)_0%,var(--color-surface-2)_42%,rgb(var(--color-accent-rgb)/0.02)_100%)] px-6 py-7 md:px-8 md:py-8">
        <div
          aria-hidden="true"
          className="absolute left-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[rgb(var(--color-accent-rgb)/0.38)] to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[rgb(var(--color-accent-rgb)/0.22)] to-transparent"
        />
        <blockquote className="relative px-3 py-3 md:px-6">
          <p
            aria-hidden="true"
            className="pointer-events-none invisible max-w-4xl text-[2.15rem] font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-[2.8rem] lg:text-[3.5rem]"
          >
            <span className="text-[rgb(var(--color-accent-rgb)/0.34)]">&ldquo;</span>
            {reserveQuote}
            <span className="text-[rgb(var(--color-accent-rgb)/0.34)]">&rdquo;</span>
          </p>
          <p className="absolute inset-3 max-w-4xl text-[2.15rem] font-semibold leading-[1.08] text-[var(--color-text-primary)] md:inset-x-6 md:inset-y-3 md:text-[2.8rem] lg:text-[3.5rem]">
            <span className="mr-[0.08em] text-[rgb(var(--color-accent-rgb)/0.34)]">&ldquo;</span>
            {renderedQuote}
            {!shouldReduceMotion ? (
              <span
                aria-hidden="true"
                className="ml-[0.06em] inline-block h-[0.88em] w-[0.08em] translate-y-[0.08em] rounded-full bg-[var(--color-accent)] align-baseline motion-safe:animate-pulse"
              />
            ) : null}
            <span className="ml-[0.06em] text-[rgb(var(--color-accent-rgb)/0.34)]">&rdquo;</span>
          </p>
        </blockquote>
      </div>
    </div>
  );
}
