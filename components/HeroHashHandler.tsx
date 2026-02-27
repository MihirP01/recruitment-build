"use client";

import { useEffect, useRef } from "react";
import { isNavigatingToHero, scrollToHero } from "@/utils/scrollToHero";

export default function HeroHashHandler() {
  const hasHandledInitialRoute = useRef(false);

  useEffect(() => {
    if (hasHandledInitialRoute.current) {
      return;
    }
    hasHandledInitialRoute.current = true;

    const rafId = window.requestAnimationFrame(() => {
      if (window.location.pathname !== "/") {
        return;
      }

      const isHeroHash = window.location.hash === "#hero";
      if (!isHeroHash && !isNavigatingToHero.current) {
        return;
      }

      scrollToHero();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
