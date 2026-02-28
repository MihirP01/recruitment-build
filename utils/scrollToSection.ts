"use client";

let snapRestoreTimeoutId: number | undefined;

function getScrollContainer(): HTMLElement | null {
  return document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
}

function shouldReduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveScrollTop(scrollRoot: HTMLElement, target: HTMLElement, sectionId: string): number {
  if (sectionId === "hero") {
    return 0;
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return Math.max(0, scrollRoot.scrollTop + targetRect.top - rootRect.top);
}

export function scrollToSection(sectionId: string, updateHash = true) {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  const scrollRoot = getScrollContainer();
  if (!scrollRoot) {
    target.scrollIntoView({
      behavior: shouldReduceMotion() ? "auto" : "smooth",
      block: "start"
    });
    if (updateHash) {
      window.history.replaceState(null, "", `#${sectionId}`);
    }
    return;
  }

  if (typeof snapRestoreTimeoutId === "number") {
    window.clearTimeout(snapRestoreTimeoutId);
  }

  const previousSnapType = scrollRoot.style.scrollSnapType;
  scrollRoot.style.scrollSnapType = "none";

  scrollRoot.scrollTo({
    top: resolveScrollTop(scrollRoot, target, sectionId),
    behavior: shouldReduceMotion() ? "auto" : "smooth"
  });

  snapRestoreTimeoutId = window.setTimeout(() => {
    scrollRoot.style.scrollSnapType = previousSnapType;
    scrollRoot.scrollTo({
      top: resolveScrollTop(scrollRoot, target, sectionId),
      behavior: "auto"
    });
  }, shouldReduceMotion() ? 0 : 700);

  if (updateHash) {
    window.history.replaceState(null, "", `#${sectionId}`);
  }
}
