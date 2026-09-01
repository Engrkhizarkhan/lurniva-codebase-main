import { Card, Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { teacherChannelFeatures } from "@/lib/data/teacher-channel";

export function TeacherChannelSection() {
  return (
    <SectionShell background="bg-surface-sunken">
      <SectionHeading
        eyebrow="Channel & community"
        eyebrowClassName="text-teal-600"
        title="Build an audience, not just a course"
        description="Every course you publish lives on your own channel — students follow you and come back for what you upload next."
        maxWidth="58ch"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teacherChannelFeatures.map((feature, index) => (
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
            </Card>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
