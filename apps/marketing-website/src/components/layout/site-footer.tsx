import Link from "next/link";
import { Icon } from "@lurniva/ui";
import { FooterColumn } from "@/components/layout/footer-column";
import { footerColumns } from "@/lib/data/nav";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-inverse px-6 pt-16 pb-10 text-cream-100 lg:px-8">
      <div className="mx-auto grid max-w-(--page-max) gap-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 grid content-start gap-3.5 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6.5 items-center justify-center rounded-sm bg-forest-700 text-accent">
                <Icon name="feather" size={16} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">
                {siteConfig.name}
              </span>
            </div>
            <span className="max-w-[30ch] text-[15px] leading-relaxed text-forest-300">
              {siteConfig.tagline}
            </span>
          </div>
          {footerColumns.map((column) => (
            <FooterColumn key={column.label} {...column} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-cream-100/[0.14] pt-6">
          <span className="text-[13px] text-forest-300">
            © {year} {siteConfig.name}. All rights reserved.
          </span>
          <div className="flex flex-wrap gap-5 text-[13px]">
            <Link href={siteConfig.social.linkedin} className="text-forest-300">
              LinkedIn
            </Link>
            {/* <Link href={siteConfig.social.youtube} className="text-forest-300">
              YouTube
            </Link> */}
            <Link
              href={siteConfig.social.instagram}
              className="text-forest-300"
            >
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
