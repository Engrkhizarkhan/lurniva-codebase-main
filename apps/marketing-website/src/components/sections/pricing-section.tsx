"use client";

import { useState } from "react";
import { Card, Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { CtaLink } from "@/components/ui/cta-link";
import { pricing, pricingAudiences } from "@/lib/data/pricing";
import type { PricingAudience } from "@/lib/data/pricing";

export function PricingSection() {
  const [audience, setAudience] = useState<PricingAudience>("Students");
  const plans = pricing[audience];

  return (
    <SectionShell id="pricing" gap="gap-8">
      <SectionHeading
        eyebrow="Pricing"
        title="Free to start, in every seat"
        maxWidth="52ch"
      />

      <div className="flex flex-wrap gap-2">
        {pricingAudiences.map((option) => {
          const active = option === audience;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setAudience(option)}
              className={`inline-flex h-11 items-center rounded-pill border px-4.5 text-[15px] font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-cream-100"
                  : "border-border-default bg-transparent text-text-heading hover:bg-surface-sunken"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div key={audience} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} index={index}>
            <Card
              dark={plan.dark}
              className={plan.dark ? "gap-4.5" : "gap-4.5 shadow-sm"}
            >
              <div className="grid gap-2">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-xl font-bold">
                    {plan.name}
                  </span>
                  <span
                    className={`rounded-pill px-2.5 py-1 text-[11px] font-bold tracking-caps uppercase ${
                      plan.dark
                        ? "bg-lime-500 text-forest-800"
                        : plan.tag === "Coming soon"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-forest-050 text-forest-700"
                    }`}
                  >
                    {plan.tag}
                  </span>
                </span>
                <span className="font-display text-[32px] font-extrabold tabular-nums">
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.dark ? "text-forest-300" : "text-text-muted"}`}>
                  {plan.note}
                </span>
              </div>

              <div className="grid gap-2.5">
                {plan.features.map((feature) => (
                  <span key={feature} className="flex gap-2.5 text-sm leading-relaxed">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0" />
                    {feature}
                  </span>
                ))}
              </div>

              <CtaLink
                href="#contact"
                variant={plan.dark ? "accent" : plan.primary ? "secondary" : "ghost"}
                fullWidth
                className="justify-center"
              >
                {plan.cta}
              </CtaLink>
            </Card>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
