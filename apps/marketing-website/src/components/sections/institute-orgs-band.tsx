import { Card, Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { orgFeatures, orgRoadmap } from "@/lib/data/org-features";

/** Condensed fold-in of the old standalone Organizations section — same content, framed as a use case under Institutes rather than a fourth top-level audience. */
export function InstituteOrgsBand() {
  return (
    <SectionShell id="orgs" gap="gap-7">
      <SectionHeading
        eyebrow="Also for organizations"
        eyebrowClassName="text-amber-600"
        title="The same engine, pointed at internal training"
        description="Handbooks, SOPs and recorded sessions instead of textbooks — the same content-to-learning pipeline, for teams."
        maxWidth="56ch"
        badge={
          <span className="w-fit rounded-pill bg-amber-100 px-2.5 py-1 text-[11px] font-bold tracking-caps text-amber-600 uppercase">
            Early access
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {orgFeatures.map((feature, index) => (
          <Reveal key={feature.title} index={index}>
            <Card className="gap-2.5">
              <span
                className={`grid size-9 place-items-center rounded-sm ${feature.iconBg} ${feature.iconFg}`}
              >
                <Icon name={feature.icon} size={19} />
              </span>
              <span className="mt-2 block font-display text-[17px] font-bold text-text-heading">
                {feature.title}
              </span>
              <span className="text-sm leading-relaxed text-text-muted">
                {feature.description}
              </span>
              <span className={`text-[11px] font-bold tracking-caps uppercase ${feature.statusClass}`}>
                {feature.status}
              </span>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm text-text-muted">On the roadmap:</span>
        {orgRoadmap.map((item) => (
          <span
            key={item}
            className="rounded-pill border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-semibold text-text-muted"
          >
            {item}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}
