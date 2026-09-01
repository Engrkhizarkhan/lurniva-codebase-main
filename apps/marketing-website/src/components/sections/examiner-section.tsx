import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { MiniProgressBar } from "@/components/ui/mini-progress-bar";

const masteryRows = [
  { label: "Algebra", status: "Strong", percent: 91, tone: "var(--forest-500)", statusClass: "text-forest-600" },
  { label: "Geometry", status: "Moderate", percent: 63, tone: "var(--amber-500)", statusClass: "text-amber-600" },
  { label: "Trigonometry", status: "Needs revision", percent: 34, tone: "var(--clay-500)", statusClass: "text-clay-600" },
];

const checks = [
  "Final accuracy",
  "Method and reasoning steps",
  "Where the mistake started",
  "Concept understanding",
  "Repeat errors across the class",
];

export function ExaminerSection() {
  return (
    <SectionShell id="examiner" background="bg-surface-inverse" dark>
      <SectionHeading
        eyebrow="The differentiator"
        title="Meet the Lurniva AI Examiner"
        description="It reads the answer, not just the answer key — and shows the teacher why it marked what it marked."
        dark
        maxWidth="58ch"
        badge={
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-lime-500 px-2.5 py-1 text-xs font-bold tracking-caps text-forest-800 uppercase">
            <Icon name="sparkles" size={14} />
            The differentiator
          </span>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <Reveal index={0} className="grid content-start gap-3.5 rounded-xl bg-forest-700 p-5.5">
          <span className="text-[11px] font-bold tracking-caps text-forest-300 uppercase">
            In · from the teacher
          </span>
          <span className="font-display text-lg font-bold">
            Mock paper 3 · Mathematics
          </span>
          <div className="grid gap-2 text-sm">
            <span className="flex items-center gap-2.5 rounded-sm bg-cream-100/[0.07] px-3 py-2.5">
              <Icon name="file-text" size={15} />
              Question paper (12 Q)
            </span>
            <span className="flex items-center gap-2.5 rounded-sm bg-cream-100/[0.07] px-3 py-2.5">
              <Icon name="scan-text" size={15} />
              31 student scripts
            </span>
            <span className="flex items-center gap-2.5 rounded-sm bg-cream-100/[0.07] px-3 py-2.5">
              <Icon name="book-open" size={15} />
              Source chapters 4–7
            </span>
          </div>
        </Reveal>

        <Reveal index={1} className="grid content-start gap-3.5 rounded-xl border border-lime-500 bg-forest-700 p-5.5">
          <span className="text-[11px] font-bold tracking-caps text-lime-500 uppercase">
            Examiner · what it checks
          </span>
          <div className="grid gap-2.5 text-sm">
            {checks.map((check) => (
              <span key={check} className="flex items-center gap-2.5">
                <Icon name="check" size={16} />
                {check}
              </span>
            ))}
          </div>
          <span className="pt-1 text-[13px] leading-relaxed text-forest-300">
            31 scripts marked in 4 minutes. 6 borderline answers routed to
            the teacher.
          </span>
        </Reveal>

        <Reveal index={2} className="overflow-hidden rounded-xl bg-surface-card text-text-body shadow-lg">
          <div className="flex items-center justify-between gap-3 bg-cream-050 px-5 py-4 shadow-[inset_0_-1px_0_rgb(3_56_36_/_8%)]">
            <span className="font-display text-[17px] font-bold text-text-heading">
              Zara K. · Mock paper 3
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-lime-100 px-2.5 py-1 text-[11px] font-bold tracking-caps text-forest-800 uppercase">
              <Icon name="sparkles" size={13} />
              AI graded
            </span>
          </div>
          <div className="grid gap-4.5 p-5">
            <div className="flex items-end gap-3.5">
              <span className="font-display text-[44px] leading-none font-extrabold tabular-nums text-text-heading">
                82%
              </span>
              <span className="grid gap-0.5 pb-1">
                <span className="text-[13px] font-semibold text-forest-600">
                  +9 points vs last paper
                </span>
                <span className="text-[13px] text-text-muted">
                  Class average 74%
                </span>
              </span>
            </div>

            <div className="grid gap-3">
              <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
                Concept mastery
              </span>
              {masteryRows.map((row) => (
                <div key={row.label} className="grid gap-1.5">
                  <span className="flex justify-between text-sm">
                    <span className="text-text-body">{row.label}</span>
                    <span className={`font-semibold ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </span>
                  <MiniProgressBar percent={row.percent} color={row.tone} height={7} />
                </div>
              ))}
            </div>

            <div className="grid gap-2 rounded-control bg-surface-inverse p-4 text-cream-100">
              <span className="text-[11px] font-bold tracking-caps text-lime-500 uppercase">
                Feedback · question 7
              </span>
              <p className="m-0 text-sm leading-relaxed">
                Your final answer is correct, but step 3 applies the sine
                rule where the cosine rule is needed — you recovered by
                chance. Redo Q7 with the cosine rule.
              </p>
              <span className="flex items-center gap-1.5 text-xs text-forest-300">
                <Icon name="link" size={14} />
                Reference: Ch.6 · p.140, worked example 2
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
