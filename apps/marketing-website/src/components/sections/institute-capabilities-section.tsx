import { Card, Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { instituteCapabilities } from "@/lib/data/institute-capabilities";

export function InstituteCapabilitiesSection() {
  return (
    <SectionShell background="bg-surface-sunken">
      <SectionHeading
        eyebrow="Built to scale"
        eyebrowClassName="text-forest-600"
        title="Infrastructure for the whole institution"
        maxWidth="52ch"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {instituteCapabilities.map((capability, index) => (
          <Reveal key={capability.title} index={index}>
            <Card className="gap-2.5">
              <span
                className={`grid size-9 place-items-center rounded-sm ${capability.iconBg} ${capability.iconFg}`}
              >
                <Icon name={capability.icon} size={19} />
              </span>
              <span className="mt-2 block font-display text-[17px] font-bold text-text-heading">
                {capability.title}
              </span>
              <span className="text-sm leading-relaxed text-text-muted">
                {capability.description}
              </span>
            </Card>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
