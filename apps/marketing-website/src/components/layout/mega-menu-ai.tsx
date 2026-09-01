import { Badge, Icon } from "@lurniva/ui";
import { MegaMenuLinkGrid } from "@/components/layout/mega-menu-link-grid";
import { aiMenuLinks } from "@/lib/data/nav";

export function MegaMenuAi() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <MegaMenuLinkGrid links={aiMenuLinks} columns={2} />
      <div className="grid content-start gap-3.5 rounded-xl bg-surface-inverse p-6 text-cream-100">
        <Badge tone="ai" icon="sparkles" caps className="bg-lime-500 text-forest-800">
          The difference
        </Badge>
        <p className="m-0 font-display text-xl font-bold leading-snug">
          Not a chatbot bolted onto a course player.
        </p>
        <p className="m-0 text-[15px] leading-relaxed text-forest-300">
          Lurniva reads the educational content you already have and turns it
          into lessons, study plans, practice and graded feedback.
        </p>
        <div className="flex items-center gap-2.5 pt-1 text-sm text-lime-500">
          <Icon name="file-text" size={16} />
          Content
          <Icon name="arrow-right" size={14} />
          Understanding
          <Icon name="arrow-right" size={14} />
          Learning
        </div>
      </div>
    </div>
  );
}
