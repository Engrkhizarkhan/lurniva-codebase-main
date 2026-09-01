import Link from "next/link";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { HeroOrbit } from "@/components/sections/hero-orbit";
import { CtaLink } from "@/components/ui/cta-link";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-surface-inverse px-6 pt-20 pb-24 text-cream-100 lg:px-8">
      <div className="mx-auto grid max-w-(--page-max) items-center gap-14 lg:grid-cols-2">
        <Reveal className="grid content-start gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-cream-100/[0.22] px-3 py-1.5 text-xs font-bold tracking-caps text-lime-500 uppercase">
            <Icon name="sparkles" size={14} />
            AI-native learning ecosystem
          </span>

          <h1 className="m-0 max-w-xl text-wrap-pretty font-display text-[44px] leading-[1.1] font-extrabold tracking-tight text-cream-100 sm:text-[52px]">
            Grow.
            <br />
            {/* Teach with AI.
            <br /> */}
            <span className="text-lime-500">Don&apos;t just learn.</span>
          </h1>

          <p className="m-0 max-w-[44ch] text-lg leading-relaxed text-forest-300 text-wrap-pretty">
            Lurniva turns your own study material into an AI companion, a
            study plan, practice and graded feedback — all in one place.
          </p>

          <div className="flex flex-wrap gap-3">
            <CtaLink
              href="#pricing"
              variant="secondary"
              size="lg"
              iconAfter={<Icon name="arrow-right" size={20} />}
            >
              Get started
            </CtaLink>
            <Link
              href="#how"
              className="inline-flex h-13 items-center gap-2 rounded-control border border-cream-100/[0.28] px-6 text-base font-semibold text-cream-100 hover:bg-cream-100/[0.08]"
            >
              See how it works
              <Icon name="compass" size={18} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-sm text-forest-300">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} />
              Free for students to start
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} />
              Cambridge, NCP, SNC, O/A
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.15} distance={16}>
          <HeroOrbit />
        </Reveal>
      </div>
    </section>
  );
}
