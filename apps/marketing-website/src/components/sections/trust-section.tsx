import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { curricula } from "@/lib/data/curricula";

/** Honest, non-fabricated trust signal — real curriculum coverage instead of invented testimonials/logos. Swap in real quotes/logos here later without a rebuild. */
export function TrustSection() {
  return (
    <SectionShell background="bg-surface-sunken" gap="gap-8">
      <SectionHeading
        eyebrow="Built for your exam board"
        title="Mapped to the curriculum you're actually sitting"
        description="Not generic study advice — coverage tied to the syllabus, subjects and past papers your exam is drawn from."
        maxWidth="56ch"
      />

      <Reveal className="flex flex-wrap gap-2.5">
        {curricula.map((curriculum) => (
          <span
            key={curriculum.id}
            className="inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-heading"
          >
            {curriculum.name}
            <span
              className={`text-[11px] font-bold tracking-caps uppercase ${
                curriculum.status === "Live" ? "text-forest-600" : "text-amber-600"
              }`}
            >
              {curriculum.status === "Live" ? "Live" : "Soon"}
            </span>
          </span>
        ))}
      </Reveal>

      <Reveal delay={0.1} className="flex items-center gap-2.5 text-sm text-text-muted">
        <Icon name="shield-check" size={17} />
        Your uploads and study data stay yours — see the Privacy Policy.
      </Reveal>
    </SectionShell>
  );
}
