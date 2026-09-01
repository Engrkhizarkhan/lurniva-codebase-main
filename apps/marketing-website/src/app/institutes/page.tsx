import type { Metadata } from "next";
import { AudienceCtaBand } from "@/components/sections/audience-cta-band";
import { InstituteCapabilitiesSection } from "@/components/sections/institute-capabilities-section";
import { InstituteOrgsBand } from "@/components/sections/institute-orgs-band";
import { InstitutesSection } from "@/components/sections/institutes-section";
import { PageHero } from "@/components/sections/page-hero";
import { ProductPreviewSection } from "@/components/sections/product-preview-section";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "For Institutes",
  description:
    "Turn your institution's own syllabi, notes and papers into an AI-powered learning environment — manage students and teachers, and see mastery by concept, cohort and campus.",
  alternates: { canonical: "/institutes" },
};

export default function InstitutesPage() {
  return (
    <>
      <PageHero
        eyebrow="For institutes"
        eyebrowIcon="building-2"
        title="Your content. Your students. Lurniva AI."
        description="Lurniva sits between the material your institution already owns and the learning experience your students deserve — indexed, assessed and reported on, at scale."
        primaryCta={{ label: "Get started", href: "/#pricing" }}
        secondaryCta={{ label: "See institute pricing", href: "/#pricing" }}
      />
      <ProductPreviewSection
        seat="institute"
        eyebrow="Your dashboard"
        eyebrowClassName="text-forest-600"
        title="One view of every campus, cohort and teacher"
        description="Content indexed, mastery tracked, and where to intervene next."
      />
      <InstitutesSection />
      <InstituteCapabilitiesSection />
      <InstituteOrgsBand />
      <AudienceCtaBand
        title="Ready to bring your institution onto Lurniva?"
        description="Start a free pilot with one cohort, or talk to us about institute pricing."
        ctaLabel="See institute pricing"
        ctaHref="/#pricing"
        email={siteConfig.emails.institutes}
        emailLabel={siteConfig.emails.institutes}
      />
    </>
  );
}
