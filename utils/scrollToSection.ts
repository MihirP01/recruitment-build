"use client";

let snapRestoreTimeoutId: number | undefined;

function getScrollContainer(): HTMLElement | null {
  return document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
}

function shouldReduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    top: Math.max(0, target.offsetTop),
    behavior: shouldReduceMotion() ? "auto" : "smooth"
  });

  snapRestoreTimeoutId = window.setTimeout(() => {
    scrollRoot.style.scrollSnapType = previousSnapType;
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }, shouldReduceMotion() ? 0 : 700);

  if (updateHash) {
    window.history.replaceState(null, "", `#${sectionId}`);
  }
}
