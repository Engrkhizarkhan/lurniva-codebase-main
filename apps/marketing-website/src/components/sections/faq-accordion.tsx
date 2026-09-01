"use client";

import { useState } from "react";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/lib/data/faqs";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-2.5">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <Reveal key={faq.question} index={index} className="overflow-hidden rounded-control border border-border-subtle bg-surface-card">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              aria-expanded={open}
              className="flex min-h-11 w-full items-center justify-between gap-4 bg-transparent px-5 py-4.5 text-left text-base font-semibold text-text-heading"
            >
              {faq.question}
              <Icon name={open ? "minus" : "plus"} size={18} className="shrink-0" />
            </button>
            {open ? (
              <p className="m-0 max-w-[72ch] px-5 pb-5 text-[15px] leading-relaxed text-text-muted">
                {faq.answer}
              </p>
            ) : null}
          </Reveal>
        );
      })}
    </div>
  );
}
