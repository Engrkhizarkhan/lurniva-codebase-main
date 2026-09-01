import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { outcomes } from "@/lib/data/outcomes";

export function OutcomesSection() {
  return (
    <SectionShell background="bg-surface-inverse" dark>
      <SectionHeading
        eyebrow="Outcomes"
        title="What changes when you study this way"
        maxWidth="52ch"
        dark
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {outcomes.map((outcome, index) => (
          <Reveal key={outcome.title} index={index}>
            <div className="grid h-full content-start gap-3 rounded-card bg-forest-700 p-5.5">
              <span className="grid size-9 place-items-center rounded-sm bg-lime-500 text-forest-800">
                <Icon name={outcome.icon} size={19} />
              </span>
              <span className="font-display text-[17px] font-bold text-cream-100">
                {outcome.title}
              </span>
              <span className="text-sm leading-relaxed text-forest-300">
                {outcome.description}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
