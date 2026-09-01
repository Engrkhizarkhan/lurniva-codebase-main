import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@lurniva/ui";
import { AboutStorySection } from "@/components/sections/about-story-section";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { aboutValues } from "@/lib/data/about-values";
import { aboutHero, ourMission, ourVision, whoWeAre } from "@/lib/data/about-content";

export const metadata: Metadata = {
  title: "About",
  description: aboutHero.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={aboutHero.eyebrow}
        eyebrowIcon="feather"
        title={aboutHero.title}
        description={aboutHero.description}
        primaryCta={{ label: "Get started", href: "/#pricing" }}
        secondaryCta={{ label: "Talk to us", href: "/#contact" }}
      />

      <SectionShell gap="gap-6">
        <Reveal>
          <span className="text-xs font-bold tracking-caps text-ember-600 uppercase">
            {whoWeAre.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.05} className="max-w-[60ch]">
          <h2 className="m-0 font-display text-3xl leading-tight font-extrabold tracking-tight text-text-heading sm:text-4xl">
            {whoWeAre.title}
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="max-w-[62ch]">
          <p className="m-0 text-lg leading-relaxed text-text-body">{whoWeAre.lead}</p>
        </Reveal>
        <div className="grid max-w-[68ch] gap-4">
          {whoWeAre.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05} index={index + 2}>
              <p className="m-0 text-[15px] leading-relaxed text-text-muted">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <AboutStorySection />

      <SectionShell background="bg-surface-sunken" gap="gap-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal className="grid content-start gap-3 rounded-card border border-border-subtle bg-surface-card p-7 shadow-sm">
            <span className="text-xs font-bold tracking-caps text-forest-600 uppercase">
              {ourMission.eyebrow}
            </span>
            <span className="font-display text-2xl leading-snug font-bold text-text-heading">
              {ourMission.title}
            </span>
            <span className="text-[15px] leading-relaxed text-text-muted">{ourMission.body}</span>
          </Reveal>
          <Reveal delay={0.08} className="grid content-start gap-3 rounded-card border border-border-subtle bg-surface-card p-7 shadow-sm">
            <span className="text-xs font-bold tracking-caps text-ember-600 uppercase">
              {ourVision.eyebrow}
            </span>
            <span className="font-display text-2xl leading-snug font-bold text-text-heading">
              {ourVision.title}
            </span>
            <span className="text-[15px] leading-relaxed text-text-muted">{ourVision.body}</span>
          </Reveal>
        </div>

        <div className="grid gap-5">
          <Reveal>
            <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
              What we care about
            </span>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((value, index) => (
              <Reveal key={value.title} index={index} className="grid gap-2 rounded-control border border-border-subtle bg-surface-card p-5">
                <Icon name={value.icon} size={20} className="text-forest-700" />
                <span className="text-[15px] font-semibold text-text-heading">{value.title}</span>
                <span className="text-sm leading-relaxed text-text-muted">{value.description}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell gap="gap-5">
        <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-card border border-border-subtle bg-surface-card p-7 shadow-sm">
          <span className="max-w-[46ch] font-display text-xl font-bold text-text-heading">
            Have an idea, a question, or a school to bring on board?
          </span>
          <Link
            href="/#contact"
            className="inline-flex h-11 items-center gap-1.5 rounded-control bg-primary px-5 text-sm font-semibold text-text-on-primary"
          >
            Talk to us
            <Icon name="arrow-right" size={16} />
          </Link>
        </Reveal>
      </SectionShell>
    </>
  );
}
