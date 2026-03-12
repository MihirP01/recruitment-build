"use client";

import { scrollToSection } from "@/utils/scrollToSection";

type HeroScrollCueProps = {
  targetId?: string;
  label?: string;
};

export default function HeroScrollCue({
  targetId = "platform",
  label = "Explore Workflow"
}: HeroScrollCueProps) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(targetId)}
      className="group inline-flex flex-col items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-secondary)]"
      aria-label={label}
    >
      <span className="flex items-center gap-3">
        <span className="h-px w-10 bg-[var(--color-border)]" />
        <span>{label}</span>
        <span className="h-px w-10 bg-[var(--color-border)]" />
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.06)] text-[12px] text-[var(--color-text-secondary)] transition-all duration-300 group-hover:translate-y-[2px] group-hover:border-[rgb(var(--color-accent-rgb)/0.4)] group-hover:bg-[rgb(var(--color-accent-rgb)/0.1)]">
        ↓
      </span>
    </button>
  );
}
