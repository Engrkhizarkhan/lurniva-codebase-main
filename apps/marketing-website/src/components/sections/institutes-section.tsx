import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { MiniProgressBar } from "@/components/ui/mini-progress-bar";
import {
  instituteFlow,
  instituteStats,
  weakestConcepts,
} from "@/lib/data/institute-flow";

export function InstitutesSection() {
  return (
    <SectionShell id="institutes">
      <SectionHeading
        eyebrow="Institutes"
        eyebrowClassName="text-forest-600"
        title="Your content. Your students. Lurniva AI."
        description="Lurniva is the layer between the material an institution already owns and the learning experience its students deserve."
        maxWidth="58ch"
      />

      <div className="grid items-start gap-7 lg:grid-cols-2">
        <Reveal className="grid gap-2.5">
          {instituteFlow.map((step, index) => (
            <div key={step.title} className="grid gap-2.5">
              <div className="flex items-center gap-3 rounded-control border border-border-subtle bg-surface-card px-4 py-3.5 shadow-xs">
                <span
                  className={`grid size-8 place-items-center rounded-sm ${step.iconBg} ${step.iconFg}`}
                >
                  <Icon name={step.icon} size={17} />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-[15px] font-semibold text-text-heading">
                    {step.title}
                  </span>
                  <span className="text-[13px] text-text-muted">
                    {step.detail}
                  </span>
                </span>
              </div>
              {index < instituteFlow.length - 1 ? (
                <span className="justify-self-center text-sand-400">
                  <Icon name="chevron-down" size={18} />
                </span>
              ) : null}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-md">
          <div className="flex items-center justify-between gap-3 bg-cream-050 px-5 py-4 shadow-[inset_0_-1px_0_rgb(3_56_36_/_8%)]">
            <span className="flex items-center gap-2.5 font-display text-[17px] font-bold text-text-heading">
              <Icon name="building-2" size={18} />
              Beacon Academy · Overview
            </span>
            <span className="text-[13px] text-text-muted">Term 2 · 2026</span>
          </div>
          <div className="grid gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              {instituteStats.map((stat) => (
                <div
                  key={stat.label}
                  className="grid gap-1.5 rounded-control border border-border-subtle bg-cream-050 p-3.5"
                >
                  <span
                    className="h-0.5 w-6 rounded-pill"
                    style={{ background: stat.tone }}
                  />
                  <span className="font-display text-[22px] font-extrabold tabular-nums text-text-heading">
                    {stat.value}
                  </span>
                  <span className="text-xs text-text-muted">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-2.5">
              <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
                Weakest concepts this month
              </span>
              <div className="grid gap-2.5">
                {weakestConcepts.map((concept) => (
                  <div key={concept.label} className="grid gap-1.5">
                    <span className="flex justify-between text-sm">
                      <span>{concept.label}</span>
                      <span className={`font-semibold ${concept.statusClass}`}>
                        {concept.percent}% mastery
                      </span>
                    </span>
                    <MiniProgressBar percent={concept.percent} color={concept.tone} height={7} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-control bg-forest-050 px-4 py-3.5 text-sm text-text-body">
              <Icon name="sparkles" size={17} />
              Lurniva AI drafted a 3-day trigonometry recovery plan for Grade
              12.
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
