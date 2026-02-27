"use client";

import { useEffect, useRef } from "react";

export default function ScrollBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const translateY = Math.max(24, 220 - y * 0.3);
      const opacity = Math.min(0.42, Math.max(0, (y - 30) / 220));

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(-50%, ${translateY}px, 0)`;
        wrapperRef.current.style.opacity = String(opacity);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 bottom-0 z-0 w-[440px] max-w-[70vw] opacity-0 will-change-transform"
    >
      <svg viewBox="0 0 640 480" className="h-auto w-full" role="presentation">
        <defs>
          <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbe7f4" />
            <stop offset="100%" stopColor="#b7cadf" />
          </linearGradient>
        </defs>
        <rect x="120" y="70" width="400" height="250" rx="18" fill="#334155" />
        <rect x="140" y="92" width="360" height="206" rx="10" fill="url(#screen)" />
        <rect x="70" y="340" width="500" height="26" rx="13" fill="#475569" />
        <rect x="260" y="320" width="120" height="20" rx="10" fill="#64748b" />
      </svg>
    </div>
  );
}
