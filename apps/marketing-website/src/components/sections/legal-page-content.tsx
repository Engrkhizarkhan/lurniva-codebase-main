"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@lurniva/ui";
import { LegalDocument } from "@/components/sections/legal-document";
import { legalContact, legalDocs, legalTabs } from "@/lib/data/legal-content";
import type { LegalTab } from "@/lib/data/legal-content";

function isLegalTab(value: string | null): value is LegalTab {
  return legalTabs.some((tab) => tab.id === value);
}

/** Reads `?tab=` client-side — required because this site is a static export, which can't read search params at build time. */
export function LegalPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: LegalTab = isLegalTab(tabParam) ? tabParam : "privacy";
  const doc = legalDocs[activeTab];

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-2">
        {legalTabs.map((legalTab) => {
          const active = legalTab.id === activeTab;
          return (
            <Link
              key={legalTab.id}
              href={`/legal?tab=${legalTab.id}`}
              className={`inline-flex h-11 items-center rounded-pill border px-4.5 text-[15px] font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-cream-100"
                  : "border-border-default bg-transparent text-text-heading hover:bg-surface-sunken"
              }`}
            >
              {legalTab.label}
            </Link>
          );
        })}
      </div>

      <LegalDocument doc={doc} />

      <div className="grid max-w-[76ch] gap-2 rounded-card border border-border-subtle bg-surface-sunken p-6">
        <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
          Contact us
        </span>
        <a
          href={`mailto:${legalContact.email}`}
          className="flex items-center gap-2 text-[15px] font-semibold text-text-heading"
        >
          <Icon name="mail" size={16} />
          {legalContact.email}
        </a>
        <span className="flex items-center gap-2 text-[15px] text-text-muted">
          <Icon name="building-2" size={16} />
          {legalContact.address}
        </span>
      </div>
    </div>
  );
}
