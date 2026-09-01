import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "@/components/sections/section-shell";
import { ourStory } from "@/lib/data/about-content";

/** The "Our story" timeline — visually modeled on `HowItWorksSection`'s numbered-circle-and-connector pattern, with a milestone period standing in for the step number. */
export function AboutStorySection() {
  return (
    <SectionShell dark background="bg-surface-inverse" gap="gap-12">
      <div className="grid gap-5">
        <Reveal>
          <span className="text-xs font-bold tracking-caps text-lime-500 uppercase">
            {ourStory.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.05} className="max-w-[60ch]">
          <h2 className="m-0 font-display text-3xl font-extrabold tracking-tight text-cream-100 sm:text-4xl">
            {ourStory.title}
          </h2>
        </Reveal>
        <div className="grid max-w-[68ch] gap-4">
          {ourStory.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05} index={index + 1}>
              <p className="m-0 text-[15px] leading-relaxed text-forest-300">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <span className="absolute inset-x-[6%] top-6.5 hidden h-px bg-forest-600 lg:block" />
        {ourStory.milestones.map((milestone, index) => (
          <Reveal key={milestone.period} index={index} className="relative grid gap-3.5 pr-6">
            <span
              className={`grid h-13 w-fit min-w-13 place-items-center rounded-full px-3 font-display text-sm font-extrabold whitespace-nowrap ${
                index === ourStory.milestones.length - 1
                  ? "border border-lime-500 bg-forest-700 text-lime-500"
                  : "bg-lime-500 text-forest-800"
              }`}
            >
              {milestone.period}
            </span>
            <span className="font-display text-xl font-bold">{milestone.title}</span>
            <span className="text-[15px] leading-relaxed text-forest-300">
              {milestone.description}
            </span>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
