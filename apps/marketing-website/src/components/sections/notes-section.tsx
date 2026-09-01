"use client";

import { useState } from "react";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";

export function NotesSection() {
  const [saved, setSaved] = useState(false);

  return (
    <SectionShell id="notes">
      <SectionHeading
        eyebrow="My Notes"
        title="Highlight. Save. Build a knowledge base."
        description="Students leave a course with more than a completion badge — they leave with their own library."
      />

      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Reveal className="grid gap-3.5 rounded-xl border border-border-subtle bg-surface-card p-6 shadow-sm">
          <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
            Reading · Biology Ch.4
          </span>
          <p className="m-0 text-base leading-relaxed text-text-body">
            Respiration releases energy from glucose in stages.{" "}
            <span className="rounded-xs bg-lime-300 px-0.5">
              The mitochondrion is the site of aerobic respiration, and its
              folded cristae increase the surface area for ATP synthesis.
            </span>{" "}
            Anaerobic pathways yield far less energy per molecule.
          </p>
          <div className="flex w-fit items-center gap-2 rounded-pill bg-primary px-3 py-2 text-cream-100">
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              className="inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-cream-100"
            >
              <Icon name="bookmark" size={16} />
              Save to notes
            </button>
            <span className="h-4 w-px bg-cream-100/[0.22]" />
            <span className="inline-flex items-center gap-1.5 text-sm text-lime-500">
              <Icon name="sparkles" size={16} />
              Explain
            </span>
          </div>
        </Reveal>

        <div className="hidden justify-self-center text-ember-500 lg:block">
          <Icon name="arrow-right" size={28} />
        </div>

        <Reveal delay={0.1} className="grid gap-4 rounded-xl border border-border-subtle bg-surface-card p-6 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 font-display text-lg font-bold text-text-heading">
              <Icon name="book-open" size={18} />
              My Notes
            </span>
            <span className="tabular-nums text-sm text-text-muted">
              {saved ? "12 highlights · 3 subjects" : "11 highlights · 3 subjects"}
            </span>
          </div>

          {saved ? (
            <div className="grid gap-2.5 rounded-control border-l-3 border-l-lime-500 bg-surface-sunken p-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-pill bg-forest-050 px-2 py-1 text-[11px] font-bold tracking-caps text-forest-700 uppercase">
                  Biology
                </span>
                <span className="rounded-pill bg-forest-050 px-2 py-1 text-[11px] font-bold tracking-caps text-forest-700 uppercase">
                  Ch.4 Cell energetics
                </span>
              </div>
              <p className="m-0 text-[15px] leading-relaxed text-text-body">
                &ldquo;The mitochondrion is the site of aerobic respiration,
                and its folded cristae increase the surface area for ATP
                synthesis.&rdquo;
              </p>
              <p className="m-0 text-sm leading-relaxed text-text-muted">
                My note: cristae → surface area → more ATP. Likely 2-mark
                definition question.
              </p>
              <span className="flex items-center gap-1.5 text-xs text-text-faint">
                <Icon name="link" size={14} />
                Source: Biology Ch.4 · p.61 · saved just now
              </span>
            </div>
          ) : null}

          <div className="grid gap-1.5 rounded-control border border-border-subtle bg-cream-050 p-3.5 opacity-75">
            <span className="text-sm font-semibold text-text-heading">
              Chemistry · Ch.2 Bonding
            </span>
            <span className="text-[13px] text-text-muted">
              4 highlights · 2 personal notes
            </span>
          </div>
          <div className="grid gap-1.5 rounded-control border border-border-subtle bg-cream-050 p-3.5 opacity-75">
            <span className="text-sm font-semibold text-text-heading">
              Mathematics · Trigonometry
            </span>
            <span className="text-[13px] text-text-muted">
              7 highlights · 5 personal notes
            </span>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
