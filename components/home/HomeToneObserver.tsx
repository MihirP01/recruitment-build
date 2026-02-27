"use client";

import { useEffect } from "react";

const TONE_THRESHOLD = 0.6;

export default function HomeToneObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("#public-home-main section[data-tone]")
    );

    if (sections.length === 0) {
      return;
    }

    const heroSection = sections.find((section) => section.id === "hero") ?? sections[0];
    const intersectionBySection = new Map<HTMLElement, number>();
    root.dataset.tone = "0";

    const applyActivePanel = () => {
      let activeSection = sections[0];
      let bestRatio = -1;

      for (const section of sections) {
        const ratio = intersectionBySection.get(section) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          activeSection = section;
        }
      }

      for (const section of sections) {
        section.dataset.panelActive = section === activeSection ? "true" : "false";
      }
    };

    const applyTone = () => {
      const heroRatio = intersectionBySection.get(heroSection) ?? 0;
      if (heroRatio > 0) {
        root.dataset.tone = "0";
        return;
      }

      let bestSection: HTMLElement | null = null;
      let bestRatio = 0;

      for (const section of sections) {
        if (section === heroSection) {
          continue;
        }

        const ratio = intersectionBySection.get(section) ?? 0;
        if (ratio >= TONE_THRESHOLD && ratio > bestRatio) {
          bestSection = section;
          bestRatio = ratio;
        }
      }

      if (bestSection?.dataset.tone) {
        root.dataset.tone = bestSection.dataset.tone;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersectionBySection.set(entry.target as HTMLElement, entry.intersectionRatio);
        }
        applyActivePanel();
        applyTone();
      },
      {
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      for (const section of sections) {
        delete section.dataset.panelActive;
      }
      root.dataset.tone = "0";
    };
  }, []);

  return null;
}
