import Link from "next/link";
import { Icon } from "@lurniva/ui";
import type { IconName } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { CtaLink } from "@/components/ui/cta-link";

export interface PageHeroCta {
  label: string;
  href: string;
}

export interface PageHeroProps {
  eyebrow: string;
  eyebrowIcon?: IconName;
  title: string;
  description: string;
  primaryCta: PageHeroCta;
  secondaryCta?: PageHeroCta;
}

/** The dark intro banner shared by every audience page (Teachers, Institutes, About) — `HeroSection` without the orbit graphic. */
export function PageHero({
  eyebrow,
  eyebrowIcon = "sparkles",
  title,
  description,
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  return (
    <section className="bg-surface-inverse px-6 pt-20 pb-20 text-cream-100 lg:px-8">
      <div className="mx-auto grid max-w-(--page-max) gap-6">
        <Reveal className="grid content-start gap-6" style={{ maxWidth: "62ch" }}>
          <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-cream-100/[0.22] px-3 py-1.5 text-xs font-bold tracking-caps text-lime-500 uppercase">
            <Icon name={eyebrowIcon} size={14} />
            {eyebrow}
          </span>

          <h1 className="m-0 text-wrap-pretty font-display text-[40px] leading-[1.1] font-extrabold tracking-tight text-cream-100 sm:text-[48px]">
            {title}
          </h1>

          <p className="m-0 max-w-[56ch] text-lg leading-relaxed text-forest-300 text-wrap-pretty">
            {description}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <CtaLink
              href={primaryCta.href}
              variant="secondary"
              size="lg"
              iconAfter={<Icon name="arrow-right" size={20} />}
            >
              {primaryCta.label}
            </CtaLink>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex h-13 items-center gap-2 rounded-control border border-cream-100/[0.28] px-6 text-base font-semibold text-cream-100 hover:bg-cream-100/[0.08]"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
