"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@lurniva/ui";
import { platformMenu, primaryNavLinks } from "@/lib/data/nav";

// aiMenuLinks is deliberately omitted here — its items (AI Companion, AI
// Examiner, ...) duplicate labels already in platformMenu's audience
// columns, which would collide as list keys.
const mobileLinks = [
  ...platformMenu.flatMap((column) => column.links),
  ...primaryNavLinks,
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-11 items-center justify-center rounded-control text-text-heading hover:bg-surface-sunken"
      >
        <Icon name={open ? "x" : "menu"} size={22} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-x-0 top-full max-h-[75vh] overflow-y-auto border-t border-border-subtle bg-surface-card shadow-lg"
          >
            <nav className="grid gap-1 p-4">
              {mobileLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-control px-3 py-3 text-[15px] font-medium text-text-heading hover:bg-surface-sunken"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#pricing"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-text-on-primary"
              >
                Get started
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
