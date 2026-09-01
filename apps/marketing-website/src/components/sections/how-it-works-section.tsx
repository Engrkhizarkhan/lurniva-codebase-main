import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "@/components/sections/section-shell";
import { howItWorksSteps } from "@/lib/data/how-it-works";

export function HowItWorksSection() {
  return (
    <SectionShell id="how" background="bg-surface-inverse" dark>
      <Reveal className="max-w-[44ch]">
        <h2 className="m-0 font-display text-3xl font-extrabold tracking-tight text-cream-100 sm:text-4xl">
          How it works
        </h2>
      </Reveal>

      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <span className="absolute inset-x-[6%] top-6.5 hidden h-px bg-forest-600 lg:block" />
        {howItWorksSteps.map((step, index) => (
          <Reveal key={step.number} index={index} className="relative grid gap-3.5 pr-6">
            <span
              className={`grid size-13 place-items-center rounded-full font-display text-base font-extrabold ${
                step.final
                  ? "bg-lime-500 text-forest-800"
                  : "border border-lime-500 bg-forest-700 text-lime-500"
              }`}
            >
              {step.number}
            </span>
            <span className="font-display text-xl font-bold">{step.title}</span>
            <span className="text-[15px] leading-relaxed text-forest-300">
              {step.description}
            </span>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
