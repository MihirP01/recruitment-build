"use client";

import { scrollToSection } from "@/utils/scrollToSection";

let snapRestoreTimeoutId: number | undefined;
export const isNavigatingToHero = { current: false };

export function markNavigatingToHero() {
  isNavigatingToHero.current = true;
}

function getScrollContainer(): HTMLElement | null {
  return document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
}

export function scrollToHero() {
  if (!getScrollContainer() && !document.getElementById("hero")) {
    isNavigatingToHero.current = false;
    return;
  }

  isNavigatingToHero.current = true;

  if (typeof window !== "undefined" && typeof snapRestoreTimeoutId === "number") {
    window.clearTimeout(snapRestoreTimeoutId);
  }

  requestAnimationFrame(() => {
    scrollToSection("hero", false);

    snapRestoreTimeoutId = window.setTimeout(() => {
      isNavigatingToHero.current = false;
    }, 700);
  });
}
