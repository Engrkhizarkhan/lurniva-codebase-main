import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "@/components/sections/section-shell";
import { CtaLink } from "@/components/ui/cta-link";

export interface AudienceCtaBandProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  email: string;
  emailLabel: string;
}

/** The closing pricing/contact band shared by `/teachers` and `/institutes`. */
export function AudienceCtaBand({
  title,
  description,
  ctaLabel,
  ctaHref,
  email,
  emailLabel,
}: AudienceCtaBandProps) {
  return (
    <SectionShell background="bg-surface-inverse" dark gap="gap-6">
      <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-card border border-cream-100/[0.14] bg-forest-700 p-7">
        <div className="grid max-w-[52ch] gap-1.5">
          <span className="font-display text-2xl font-bold text-cream-100">{title}</span>
          <span className="text-[15px] leading-relaxed text-forest-300">{description}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CtaLink href={ctaHref} variant="accent" size="md">
            {ctaLabel}
          </CtaLink>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cream-100"
          >
            <Icon name="mail" size={16} />
            {emailLabel}
          </a>
        </div>
      </Reveal>
    </SectionShell>
  );
}
