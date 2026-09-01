"use client";

import Link from "next/link";
import { useState } from "react";
import { CtaLink } from "@/components/ui/cta-link";
import { MegaMenuAi } from "@/components/layout/mega-menu-ai";
import { MegaMenuPanel } from "@/components/layout/mega-menu-panel";
import { MegaMenuPlatform } from "@/components/layout/mega-menu-platform";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavTrigger } from "@/components/layout/nav-trigger";
import { primaryNavLinks } from "@/lib/data/nav";
import Image from "next/image";

type MenuId = "platform" | "ai";

const triggers: { id: MenuId; label: string }[] = [
  { id: "platform", label: "Platform" },
  { id: "ai", label: "AI" },
];

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);

  return (
    <header
      className="sticky top-0 z-50 bg-surface-canvas shadow-[inset_0_-1px_0_rgb(3_56_36_/_8%)]"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="relative mx-auto flex h-(--topbar-h) max-w-(--page-max) items-center gap-2 px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center gap-2.5">
          {" "}
          <Image
            src="/lurniva_logo.jfif"
            alt="Lurniva"
            width={26}
            height={26}
            className="size-6.5 rounded-sm"
          />{" "}
          <span className="font-display text-xl font-extrabold tracking-tight text-text-heading">
            {" "}
            Lurniva{" "}
          </span>{" "}
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {triggers.map((trigger) => (
            <NavTrigger
              key={trigger.id}
              label={trigger.label}
              active={openMenu === trigger.id}
              onEnter={() => setOpenMenu(trigger.id)}
            />
          ))}
          {primaryNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => setOpenMenu(null)}
              className="flex items-center gap-1 rounded-control px-3 py-2.5 text-[15px] font-medium text-text-heading transition-colors hover:bg-surface-sunken"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <CtaLink href="/#pricing" variant="primary" size="sm">
            Get started
          </CtaLink>
        </div>

        <div className="ml-auto lg:hidden">
          <MobileNav />
        </div>
      </div>

      <MegaMenuPanel open={openMenu === "platform"}>
        <MegaMenuPlatform />
      </MegaMenuPanel>
      <MegaMenuPanel open={openMenu === "ai"}>
        <MegaMenuAi />
      </MegaMenuPanel>
    </header>
  );
}
