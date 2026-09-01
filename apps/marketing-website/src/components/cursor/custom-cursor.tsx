"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor="hover"]';
const TEXT_SELECTOR = 'h1, h2, h3, [data-cursor="text"]';

/**
 * A fixed-position ring that trails the pointer and reacts to what it's
 * over — link/button targets grow the ring, headings hollow it into a
 * text caret. Only mounts on fine-pointer, motion-safe devices: touch
 * screens and reduced-motion visitors keep the native cursor untouched.
 */
// This component is only ever mounted client-side (see layout.tsx's
// `dynamic(..., { ssr: false })` import), so reading matchMedia in the
// state initializer below can't cause a server/client hydration mismatch.
function computeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return fine && !reduced;
}

export function CustomCursor() {
  const [enabled] = useState(computeEnabled);
  const [variant, setVariant] = useState<"default" | "interactive" | "text">(
    "default",
  );
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springConfig = { damping: 28, stiffness: 340, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setVariant("interactive");
      } else if (target?.closest(TEXT_SELECTOR)) {
        setVariant("text");
      } else {
        setVariant("default");
      }
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerleave", handleLeave);
    document.addEventListener("pointerenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("pointerenter", handleEnter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = variant === "interactive" ? 52 : variant === "text" ? 4 : 16;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-cream-100 mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: size,
        height: variant === "text" ? 24 : size,
        opacity: visible ? (variant === "default" ? 0.9 : 1) : 0,
      }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      initial={false}
    />
  );
}
