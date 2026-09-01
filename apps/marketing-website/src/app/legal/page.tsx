import { Suspense } from "react";
import type { Metadata } from "next";
import { LegalPageContent } from "@/components/sections/legal-page-content";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata: Metadata = {
  title: "Legal",
  description: "Lurniva's Privacy Policy, Terms of Service, Cookie Policy and IP Policy.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <SectionShell gap="gap-10">
      <Suspense fallback={null}>
        <LegalPageContent />
      </Suspense>
    </SectionShell>
  );
}
