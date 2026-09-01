import Link from "next/link";
import type { FooterColumnData } from "@/lib/data/nav";

export function FooterColumn({ label, links }: FooterColumnData) {
  return (
    <div className="grid content-start gap-2.5 text-sm">
      <span className="text-xs font-bold tracking-caps text-forest-300 uppercase">
        {label}
      </span>
      {links.map((link) => (
        <Link key={link.label} href={link.href} className="text-cream-100">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
