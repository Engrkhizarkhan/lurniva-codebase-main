"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export interface MegaMenuPanelProps {
  open: boolean;
  children: ReactNode;
}

/**
 * Shared dropdown shell every mega menu renders into — background, shadow,
 * positioning and the open/close transition live here once so each menu
 * (Platform, AI, Curriculum, Resources, Company) only supplies its content.
 */
export function MegaMenuPanel({ open, children }: MegaMenuPanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-x-0 top-full border-t border-border-subtle bg-surface-card shadow-lg"
        >
          <div className="mx-auto max-w-(--page-max) px-8 py-8">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
