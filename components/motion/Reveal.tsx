"use client";

import { ElementType, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealDirection = "up" | "down" | "none";

type RevealProps<T extends ElementType = "div"> = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  as?: T;
};

const DIRECTION_OFFSET: Record<RevealDirection, number> = {
  up: 14,
  down: -14,
  none: 0
};

export default function Reveal<T extends ElementType = "div">({
  children,
  className,
  delay = 0,
  direction = "up",
  as
}: RevealProps<T>) {
  const reducedMotion = useReducedMotion();
  const Tag = (as ?? "div") as ElementType;

  if (reducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className}>
      <motion.div
        initial={{ opacity: 0, y: DIRECTION_OFFSET[direction] }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.4, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </Tag>
  );
}
