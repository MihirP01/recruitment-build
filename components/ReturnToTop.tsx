"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { scrollToHero } from "@/utils/scrollToHero";

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ReturnToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollRoot = document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
    const hero = document.getElementById("hero");

    if (!hero) {
      return;
    }

    let heroVisible = true;
    let beyondThreshold = false;

    const updateVisibility = () => {
      const containerHeight = scrollRoot ? scrollRoot.clientHeight : window.innerHeight;
      const currentScrollTop = scrollRoot ? scrollRoot.scrollTop : window.scrollY;
      beyondThreshold = currentScrollTop > containerHeight * 0.6;
      setVisible(!heroVisible && beyondThreshold);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0]?.isIntersecting ?? false;
        updateVisibility();
      },
      {
        root: scrollRoot,
        threshold: 0.15
      }
    );

    observer.observe(hero);

    if (scrollRoot) {
      scrollRoot.addEventListener("scroll", updateVisibility, { passive: true });
    } else {
      window.addEventListener("scroll", updateVisibility, { passive: true });
    }

    updateVisibility();

    return () => {
      observer.disconnect();
      if (scrollRoot) {
        scrollRoot.removeEventListener("scroll", updateVisibility);
      } else {
        window.removeEventListener("scroll", updateVisibility);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          key="return-to-top"
          type="button"
          aria-label="Return to top"
          onClick={() => scrollToHero()}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.24, ease: REVEAL_EASE }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B1220]/90 text-[#E5E7EB] shadow-xl backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7EA6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] md:right-6"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
