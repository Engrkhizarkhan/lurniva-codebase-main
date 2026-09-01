import type { Metadata } from "next";
import { AudienceCtaBand } from "@/components/sections/audience-cta-band";
import { ExaminerSection } from "@/components/sections/examiner-section";
import { PageHero } from "@/components/sections/page-hero";
import { ProductPreviewSection } from "@/components/sections/product-preview-section";
import { TeacherChannelSection } from "@/components/sections/teacher-channel-section";
import { TeacherSection } from "@/components/sections/teacher-section";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "For Teachers",
  description:
    "Upload your material and let AI turn it into lessons, assessments and grading — build a channel, teach on your own content, and let Lurniva handle the repetitive work.",
  alternates: { canonical: "/teachers" },
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="For teachers"
        eyebrowIcon="presentation"
        title="Teach with an AI co-pilot. Create once, teach for years."
        description="Upload what you already have — slides, PDFs, recordings — and Lurniva turns it into lectures, practice and graded feedback, while you keep the final say."
        primaryCta={{ label: "Get started", href: "/#pricing" }}
        secondaryCta={{ label: "See teacher pricing", href: "/#pricing" }}
      />
      <ProductPreviewSection
        seat="teacher"
        eyebrow="Your studio"
        eyebrowClassName="text-teal-600"
        title="Everything you upload, in one workspace"
        description="Content, students, AI tools and revenue — one dashboard."
        background="bg-surface-canvas"
      />
      <TeacherSection />
      <ExaminerSection />
      <TeacherChannelSection />
      <AudienceCtaBand
        title="Ready to teach on Lurniva?"
        description="Publish your first course free, or talk to us about the Professional plan."
        ctaLabel="See teacher pricing"
        ctaHref="/#pricing"
        email={siteConfig.emails.teachers}
        emailLabel={siteConfig.emails.teachers}
      />
    </>
  );
}
