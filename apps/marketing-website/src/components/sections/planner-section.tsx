"use client";

import { useState } from "react";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { planDayDetails, planSubjects, planTopics } from "@/lib/data/shells";
import type { PlanSubject } from "@/lib/data/shells";

const dayOptions = [5, 7, 14] as const;
const minuteOptions = [30, 60, 90] as const;

function PickerPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center rounded-pill border px-3.5 text-sm font-semibold transition-colors ${
        active
          ? "border-lime-500 bg-lime-500 text-forest-800"
          : "border-cream-100/[0.28] bg-transparent text-cream-100 hover:bg-cream-100/[0.08]"
      }`}
    >
      {label}
    </button>
  );
}

export function PlannerSection() {
  const [subject, setSubject] = useState<PlanSubject>("Biology");
  const [days, setDays] = useState<(typeof dayOptions)[number]>(7);
  const [minutes, setMinutes] = useState<(typeof minuteOptions)[number]>(60);

  const topics = planTopics[subject];
  const rows = Array.from({ length: Math.min(5, days) }, (_, i) => ({
    day: i + 1,
    topic: topics[i % topics.length],
    detail: planDayDetails[i] ?? "Mixed recall",
    time: `${minutes} min`,
  }));

  return (
    <SectionShell id="planner" background="bg-surface-inverse" dark gap="gap-10">
      <SectionHeading
        eyebrow="Lesson planner"
        title="Pick your content and your time. Get a plan."
        dark
      />

      <div className="grid items-start gap-7 lg:grid-cols-2">
        <Reveal className="grid content-start gap-5.5 rounded-xl bg-forest-700 p-6">
          <div className="grid gap-2.5">
            <span className="text-xs font-bold tracking-caps text-forest-300 uppercase">
              01 — Content
            </span>
            <div className="flex flex-wrap gap-2">
              {planSubjects.map((option) => (
                <PickerPill
                  key={option}
                  label={option}
                  active={subject === option}
                  onClick={() => setSubject(option)}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2.5">
            <span className="text-xs font-bold tracking-caps text-forest-300 uppercase">
              02 — Days available
            </span>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((option) => (
                <PickerPill
                  key={option}
                  label={`${option} days`}
                  active={days === option}
                  onClick={() => setDays(option)}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2.5">
            <span className="text-xs font-bold tracking-caps text-forest-300 uppercase">
              03 — Minutes per day
            </span>
            <div className="flex flex-wrap gap-2">
              {minuteOptions.map((option) => (
                <PickerPill
                  key={option}
                  label={`${option} min`}
                  active={minutes === option}
                  onClick={() => setMinutes(option)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-1 text-sm text-lime-500">
            <Icon name="sparkles" size={16} />
            {subject} → {days} days → {minutes} min/day
          </div>
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden rounded-xl bg-surface-card shadow-lg">
          <div className="flex items-center justify-between gap-3 bg-cream-050 px-5 py-4 shadow-[inset_0_-1px_0_rgb(3_56_36_/_8%)]">
            <span className="font-display text-[17px] font-bold text-text-heading">
              {subject} · {days}-day plan
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-lime-100 px-2.5 py-1 text-[11px] font-bold tracking-caps text-forest-800 uppercase">
              <Icon name="sparkles" size={13} />
              AI generated
            </span>
          </div>
          <div className="grid px-5 pt-2 pb-5">
            {rows.map((row) => (
              <div
                key={row.day}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 border-b border-border-subtle py-3.5 last:border-0"
              >
                <span className="grid justify-items-center gap-0.5 rounded-control bg-surface-sunken py-1.5 text-center">
                  <span className="text-[11px] font-bold tracking-caps text-text-muted uppercase">
                    Day
                  </span>
                  <span className="font-display text-[17px] font-extrabold tabular-nums text-text-heading">
                    {row.day}
                  </span>
                </span>
                <span className="grid gap-0.5">
                  <span className="text-[15px] font-semibold text-text-heading">
                    {row.topic}
                  </span>
                  <span className="text-[13px] text-text-muted">{row.detail}</span>
                </span>
                <span className="text-[13px] font-semibold tabular-nums text-text-muted">
                  {row.time}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
