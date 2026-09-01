import { ContactSection } from "@/components/sections/contact-section";
import { CurriculumSection } from "@/components/sections/curriculum-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { NotesSection } from "@/components/sections/notes-section";
import { OutcomesSection } from "@/components/sections/outcomes-section";
import { PlannerSection } from "@/components/sections/planner-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ProductPreviewSection } from "@/components/sections/product-preview-section";
import { StudentSection } from "@/components/sections/student-section";
import { TeachersMarketplaceSection } from "@/components/sections/teachers-marketplace-section";
import { TrustSection } from "@/components/sections/trust-section";
import { ValueChainSection } from "@/components/sections/value-chain-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValueChainSection />
      <HowItWorksSection />
      <ProductPreviewSection
        seat="student"
        eyebrow="Your dashboard"
        title="Everything you're studying, in one place"
        description="Today's plan, your streak, and the chapters you're mid-way through."
      />
      <StudentSection />
      <PlannerSection />
      <NotesSection />
      <TeachersMarketplaceSection />
      <CurriculumSection />
      <OutcomesSection />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
