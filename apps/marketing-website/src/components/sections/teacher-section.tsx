import { Card, Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { StepLabel } from "@/components/ui/step-label";

const revenueBars = [32, 48, 40, 64, 78, 100];

export function TeacherSection() {
  return (
    <SectionShell id="teacher" background="bg-surface-sunken">
      <SectionHeading
        eyebrow="Teacher experience"
        eyebrowClassName="text-teal-600"
        title="More than a course platform"
        description="Create → teach → automate → assess → monetise. One pipeline, from the file you already have."
        maxWidth="58ch"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Reveal className="grid content-start gap-5" index={0}>
          <Card className="gap-3.5">
            <StepLabel>Step 01 · Upload</StepLabel>
            <span className="mt-3 block font-display text-lg font-bold text-text-heading">
              Bring your material
            </span>
            <div className="mt-2 grid gap-2">
              {[
                { icon: "file-text" as const, label: "Waves handout.pdf", meta: "4.2 MB" },
                { icon: "presentation" as const, label: "Ch.7 slides.pptx", meta: "18 slides" },
                { icon: "play" as const, label: "Optics lesson.mp4", meta: "32 min" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center justify-between gap-2.5 rounded-sm bg-surface-sunken px-3 py-2.5 text-[13px]"
                >
                  <span className="flex items-center gap-2">
                    <Icon name={item.icon} size={15} />
                    {item.label}
                  </span>
                  <span className="text-text-muted">{item.meta}</span>
                </span>
              ))}
            </div>
          </Card>

          <Card dark className="gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-lime-500 px-2.5 py-1 text-[11px] font-bold tracking-caps text-forest-800 uppercase">
              <Icon name="sparkles" size={13} />
              Step 02 · AI reads it
            </span>
            <span className="font-display text-lg font-bold">
              Reading your PDF — 28 of 40 pages
            </span>
            <span className="block h-2 overflow-hidden rounded-pill bg-cream-100/[0.16]">
              <span
                style={{ width: "70%", animation: "lv-grow 1.6s var(--ease-standard)" }}
                className="block h-2 rounded-pill bg-lime-500"
              />
            </span>
            <span className="text-sm leading-relaxed text-forest-300">
              Chapters, definitions, diagrams and worked examples are indexed
              — not just stored.
            </span>
          </Card>
        </Reveal>

        <Reveal className="grid content-start gap-5" index={1}>
          <Card className="gap-3.5">
            <StepLabel>Step 03 · AI lecture</StepLabel>
            <span className="mt-3 block font-display text-lg font-bold text-text-heading">
              A lesson, generated
            </span>
            <div className="relative mt-2 grid aspect-video place-items-center rounded-control bg-forest-800">
              <span className="grid size-13 place-items-center rounded-full bg-lime-500 text-forest-800">
                <Icon name="play" size={22} />
              </span>
              <span className="absolute top-3 left-3 rounded-pill bg-forest-800/80 px-2 py-1 text-[11px] font-bold tracking-caps text-lime-500 uppercase">
                AI generated
              </span>
              <span className="absolute right-3 bottom-3 left-3 block h-1 rounded-pill bg-cream-100/[0.24]">
                <span className="block h-1 w-[34%] rounded-pill bg-cream-100" />
              </span>
            </div>
            <div className="mt-2 grid gap-1.5 text-[13px] text-text-body">
              <span className="flex items-center justify-between">
                <span>1. What a wave carries</span>
                <span className="text-text-muted">4:12</span>
              </span>
              <span className="flex items-center justify-between">
                <span>2. Frequency and wavelength</span>
                <span className="text-text-muted">6:40</span>
              </span>
              <span className="flex items-center justify-between">
                <span>3. Worked example — p.83</span>
                <span className="text-text-muted">5:03</span>
              </span>
            </div>
          </Card>

          <Card className="gap-3">
            <StepLabel>Step 04 · Teach</StepLabel>
            <span className="mt-3 block font-display text-lg font-bold text-text-heading">
              Students learn from your content
            </span>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="flex">
                <span className="grid size-7.5 place-items-center rounded-full bg-ember-100 text-xs font-bold text-ember-700">
                  AY
                </span>
                <span className="-ml-2 grid size-7.5 place-items-center rounded-full bg-forest-100 text-xs font-bold text-forest-700">
                  ZK
                </span>
                <span className="-ml-2 grid size-7.5 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                  MR
                </span>
              </span>
              <span className="tabular-nums text-[13px] text-text-muted">
                1,842 students enrolled this term
              </span>
            </div>
          </Card>
        </Reveal>

        <Reveal className="grid content-start gap-5" index={2}>
          <Card className="gap-3.5">
            <StepLabel>Step 05 · Assess &amp; grade</StepLabel>
            <span className="mt-3 block font-display text-lg font-bold text-text-heading">
              Papers built from the chapter
            </span>
            <div className="mt-2 grid gap-2">
              <span className="flex items-center justify-between gap-2.5 rounded-sm bg-surface-sunken px-3 py-2.5 text-[13px]">
                <span>Mock paper 3 · 31 scripts</span>
                <span className="font-semibold text-forest-600">Graded</span>
              </span>
              <span className="flex items-center justify-between gap-2.5 rounded-sm bg-surface-sunken px-3 py-2.5 text-[13px]">
                <span>Ch.7 quick check · 12 Q</span>
                <span className="text-text-muted">Generated</span>
              </span>
              <span className="flex items-center justify-between gap-2.5 rounded-sm bg-ember-050 px-3 py-2.5 text-[13px]">
                <span>6 answers flagged</span>
                <span className="font-semibold text-ember-700">Your review</span>
              </span>
            </div>
          </Card>

          <Card className="gap-3.5">
            <StepLabel>Step 06 · Earn</StepLabel>
            <div className="mt-1 grid gap-1">
              <span className="h-0.5 w-7 rounded-pill bg-lime-500" />
              <span className="font-display text-3xl font-extrabold tabular-nums text-text-heading">
                PKR 486,200
              </span>
              <span className="text-[13px] text-text-muted">
                This month · +18% vs last month
              </span>
            </div>
            <div className="mt-2 flex h-19 items-end gap-1.5">
              {revenueBars.map((height, index) => (
                <span
                  key={height}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-xs ${
                    index === revenueBars.length - 1
                      ? "bg-ember-500"
                      : index >= revenueBars.length - 2
                        ? "bg-forest-500"
                        : index === revenueBars.length - 3
                          ? "bg-forest-300"
                          : "bg-forest-100"
                  }`}
                />
              ))}
            </div>
            <span className="mt-2 text-[13px] text-text-muted">
              312 active subscriptions · 4 courses live
            </span>
          </Card>
        </Reveal>
      </div>
    </SectionShell>
  );
}
