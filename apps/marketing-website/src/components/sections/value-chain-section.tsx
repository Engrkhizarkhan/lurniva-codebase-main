import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { lurnivaChain, traditionalSteps } from "@/lib/data/value-chain";

export function ValueChainSection() {
  return (
    <SectionShell>
      <SectionHeading
        eyebrow="Why Lurniva"
        title="The same content, a longer chain of value"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Reveal className="grid content-start gap-3.5 rounded-xl border border-border-subtle p-6">
          <span className="font-display text-lg font-bold text-text-muted">
            Traditional learning
          </span>
          {traditionalSteps.map((step, index) => (
            <div key={step} className="grid gap-3.5">
              <span className="flex items-center gap-2.5 rounded-sm bg-surface-sunken px-3.5 py-3 text-[15px] text-text-muted">
                {step}
              </span>
              {index < traditionalSteps.length - 1 ? (
                <span className="justify-self-center text-sand-400">
                  <Icon name="chevron-down" size={16} />
                </span>
              ) : null}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="grid content-start gap-4 rounded-xl bg-surface-inverse p-6 text-cream-100">
          <span className="font-display text-lg font-bold">With Lurniva</span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {lurnivaChain.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2.5 rounded-sm bg-cream-100/[0.07] px-3.5 py-3 text-sm"
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </span>
            ))}
          </div>
          <span className="pt-1 text-[15px] leading-relaxed text-forest-300">
            Every step reuses the same indexed material — nothing has to be
            rebuilt for practice, assessment or revision.
          </span>
        </Reveal>
      </div>
    </SectionShell>
  );
}
