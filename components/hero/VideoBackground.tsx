"use client";

import { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type VideoBackgroundProps = {
  srcMp4: string;
  srcWebm?: string;
  poster: string;
  fallback?: string;
  parallax?: boolean;
  className?: string;
};

function mergeClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export default function VideoBackground({
  srcMp4,
  srcWebm,
  poster,
  fallback,
  parallax = false,
  className
}: VideoBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const hasVideoSource = Boolean(srcMp4 || srcWebm);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const mediaY = parallax && !shouldReduceMotion ? parallaxY : "0%";

  return (
    <div className={mergeClassNames("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}>
      {!hasVideoSource || videoFailed ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${fallback ?? poster}')` }}
          aria-hidden="true"
        />
      ) : null}

      <motion.div className="absolute -inset-y-[20%] inset-x-0 will-change-transform" style={{ y: mediaY }}>
        {hasVideoSource && !videoFailed ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            poster={poster}
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
            {srcMp4 ? <source src={srcMp4} type="video/mp4" /> : null}
          </video>
        ) : null}
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgb(var(--hero-overlay-rgb) / var(--hero-overlay-base-alpha))"
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-core-alpha)) 0%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-mid-alpha)) 72%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-radial-edge-alpha)) 100%)"
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--hero-overlay-rgb) / 0.06) 0%, rgb(var(--hero-overlay-rgb) / var(--hero-overlay-bottom-alpha)) 100%)"
        }}
        aria-hidden="true"
      />
    </div>
  );
}
