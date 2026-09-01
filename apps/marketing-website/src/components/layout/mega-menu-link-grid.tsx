import Link from "next/link";
import type { NavLink } from "@/lib/data/nav";

export interface MegaMenuLinkGridProps {
  links: NavLink[];
  columns?: 2 | 4;
}

/** A grid of label+description link cards — used by the AI mega-menu. */
export function MegaMenuLinkGrid({ links, columns = 4 }: MegaMenuLinkGridProps) {
  return (
    <div
      className={
        columns === 4
          ? "grid grid-cols-2 gap-3 md:grid-cols-4"
          : "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      }
    >
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="grid gap-0.5 rounded-control p-3.5 text-text-body transition-colors hover:bg-surface-sunken"
        >
          <span className="font-display text-base font-semibold text-text-heading">
            {link.label}
          </span>
          <span className="text-sm text-text-muted">{link.description}</span>
        </Link>
      ))}
    </div>
  );
}
