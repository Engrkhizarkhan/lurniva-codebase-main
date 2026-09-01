import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { StudentChatDemo } from "@/components/sections/student-chat-demo";
import { studentCapabilities } from "@/lib/data/student-capabilities";

export function StudentSection() {
  return (
    <SectionShell id="student">
      <SectionHeading
        eyebrow="Student experience"
        title="Study with AI — not just search with AI"
        description="The companion answers from the chapter you are actually on, and everything it produces can be saved, practised or scheduled."
        maxWidth="58ch"
      />

      <div className="grid items-start gap-7 lg:grid-cols-2">
        <div className="grid content-start gap-4 pt-2">
          {studentCapabilities.map((capability, index) => (
            <Reveal key={capability.title} index={index}>
              <div className="grid gap-1.5 rounded-control border border-border-subtle bg-surface-card p-4 shadow-sm">
                <span className="flex items-center gap-2.5 text-[15px] font-semibold text-text-heading">
                  <Icon name={capability.icon} size={17} />
                  {capability.title}
                </span>
                <span className="text-[13px] text-text-muted">
                  {capability.description}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <StudentChatDemo />
        </Reveal>
      </div>
    </SectionShell>
  );
}
