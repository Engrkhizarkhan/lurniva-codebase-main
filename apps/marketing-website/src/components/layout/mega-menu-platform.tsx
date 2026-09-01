import Link from "next/link";
import { Icon } from "@lurniva/ui";
import { platformMenu } from "@/lib/data/nav";

export function MegaMenuPlatform() {
  return (
    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
      {platformMenu.map((column) => (
        <div key={column.label} className="grid content-start gap-3">
          <div className={`flex items-center gap-2 ${column.iconClassName}`}>
            <Icon name={column.icon} size={18} />
            <span className="text-xs font-bold tracking-caps uppercase">
              {column.label}
            </span>
          </div>
          {column.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="-mx-2.5 grid gap-0.5 rounded-control px-2.5 py-2 text-text-body transition-colors hover:bg-surface-sunken"
            >
              <span className="text-[15px] font-semibold text-text-heading">
                {link.label}
              </span>
              <span className="text-[13px] text-text-muted">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
