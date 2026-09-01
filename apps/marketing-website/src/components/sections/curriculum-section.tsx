"use client";

import { useState } from "react";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { MiniProgressBar } from "@/components/ui/mini-progress-bar";
import { curricula } from "@/lib/data/curricula";

export function CurriculumSection() {
  const [activeId, setActiveId] = useState(curricula[0]!.id);
  const active = curricula.find((c) => c.id === activeId) ?? curricula[0]!;

  return (
    <SectionShell id="curriculum" gap="gap-8">
      <SectionHeading
        eyebrow="Curriculum"
        eyebrowClassName="text-forest-600"
        title="Choose your curriculum"
      />

      <div className="flex flex-wrap gap-2.5">
        {curricula.map((curriculum) => {
          const isActive = curriculum.id === activeId;
          return (
            <button
              key={curriculum.id}
              type="button"
              onClick={() => setActiveId(curriculum.id)}
              className={`inline-flex h-11 items-center gap-2 rounded-pill border px-4 text-[15px] font-semibold transition-colors ${
                isActive
                  ? "border-primary bg-primary text-cream-100"
                  : "border-border-default bg-transparent text-text-heading hover:bg-surface-sunken"
              }`}
            >
              {curriculum.name}
              <span
                className={`text-[11px] font-bold tracking-caps uppercase ${
                  isActive
                    ? "text-lime-500"
                    : curriculum.status === "Live"
                      ? "text-forest-600"
                      : "text-amber-600"
                }`}
              >
                {curriculum.status === "Live" ? "Live" : "Soon"}
              </span>
            </button>
          );
        })}
      </div>

      <Reveal key={active.id} distance={12} className="grid grid-cols-1 gap-8 rounded-xl border border-border-subtle bg-surface-card p-7 shadow-sm md:grid-cols-[1fr_1fr_0.9fr]">
        <div className="grid content-start gap-3.5">
          <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
            Subjects
          </span>
          <div className="flex flex-wrap gap-2">
            {active.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-pill bg-surface-sunken px-3 py-2 text-sm font-medium text-text-body"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-3.5">
          <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
            Example courses
          </span>
          <div className="grid gap-2.5">
            {active.courses.map((course) => (
              <span
                key={course}
                className="flex items-center gap-2.5 rounded-control border border-border-subtle bg-cream-050 px-3.5 py-3 text-[15px] text-text-body"
              >
                <Icon name="play" size={16} />
                {course}
              </span>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-3.5">
          <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
            Levels &amp; coverage
          </span>
          <span className="text-[15px] text-text-body">{active.levels}</span>
          <MiniProgressBar
            percent={active.coverage || 4}
            color="var(--forest-500)"
            height={8}
          />
          <span className="tabular-nums text-sm text-text-muted">
            {active.coverage
              ? `${active.coverage}% of the syllabus mapped to courses`
              : "Mapping in progress — join the waitlist"}
          </span>
        </div>
      </Reveal>
    </SectionShell>
  );
}
