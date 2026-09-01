import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { TeacherGrid } from "@/components/sections/teacher-grid";

const subjectFilters = [
  { label: "All subjects", active: true },
  { label: "Sciences", active: false },
  { label: "Mathematics", active: false },
  { label: "Cambridge", active: false },
];

export function TeachersMarketplaceSection() {
  return (
    <SectionShell id="teachers" background="bg-surface-sunken" gap="gap-9">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Teacher marketplace"
          eyebrowClassName="text-teal-600"
          title="Learn from teachers you trust"
          maxWidth="52ch"
        />
        <div className="flex flex-wrap gap-2">
          {subjectFilters.map((filter) => (
            <span
              key={filter.label}
              className={`rounded-pill px-3.5 py-2 text-sm font-semibold ${
                filter.active
                  ? "bg-primary text-cream-100"
                  : "border border-border-default bg-surface-card text-text-heading"
              }`}
            >
              {filter.label}
            </span>
          ))}
        </div>
      </div>

      <TeacherGrid />

      <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-card border border-border-subtle bg-surface-card p-6 shadow-sm">
        <div className="grid gap-1.5">
          <span className="flex items-center gap-2.5 font-display text-lg font-bold text-text-heading">
            <Icon name="heart" size={18} />
            My favourite teachers
          </span>
          <span className="text-sm text-text-muted">
            Save a teacher and their new lessons appear in your plan.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex">
            <span className="grid size-9 place-items-center rounded-full bg-teal-100 text-[13px] font-bold text-teal-600">
              HI
            </span>
            <span className="-ml-2.5 grid size-9 place-items-center rounded-full bg-ember-100 text-[13px] font-bold text-ember-700">
              NR
            </span>
            <span className="-ml-2.5 grid size-9 place-items-center rounded-full bg-forest-100 text-[13px] font-bold text-forest-700">
              AR
            </span>
          </span>
          <span className="text-sm text-text-muted">3 saved</span>
        </div>
      </Reveal>
    </SectionShell>
  );
}
