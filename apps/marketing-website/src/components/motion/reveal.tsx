"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Vertical travel distance in px before the element settles. */
  distance?: number;
  delay?: number;
  /** Stagger index — multiplies `delay` so a list of Reveals cascades without each caller doing the math. */
  index?: number;
  as?: "div" | "span" | "li";
}

/**
 * Fades and slides a section into view the first time it crosses the viewport.
 * The single scroll-reveal primitive every section composes with, so the
 * animation curve only lives in one place.
 */
export function Reveal({
  children,
  className,
  style,
  distance = 24,
  delay = 0,
  index = 0,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      style={style}
      initial={prefersReducedMotion ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: delay + index * 0.08,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
