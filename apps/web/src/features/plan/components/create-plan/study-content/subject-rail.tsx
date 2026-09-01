import { cn } from "@lurniva/ui";
import type { SubjectRailItem } from "../../../hooks/useStudyContentSelection";

interface SubjectRailProps {
  items: SubjectRailItem[];
  onSelect: (subjectId: string) => void;
}

export function SubjectRail({ items, onSelect }: SubjectRailProps) {
  return (
    <div className="grid content-start gap-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.subjectId}
            type="button"
            onClick={() => onSelect(item.subjectId)}
            aria-pressed={item.isActive}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left transition-colors duration-150",
              item.isActive
                ? "bg-primary text-text-on-primary shadow-sm"
                : "text-text-body hover:bg-surface-sunken",
            )}
          >
            <Icon
              size={16}
              className={item.isActive ? "text-text-on-primary" : "text-text-muted"}
            />
            <span className="flex-1 text-sm font-semibold">{item.label}</span>
            {item.selectedTopicCount > 0 ? (
              <span
                className={cn(
                  "rounded-pill px-2 py-0.5 text-xs font-bold",
                  item.isActive
                    ? "bg-white/20 text-text-on-primary"
                    : "bg-primary-soft text-primary",
                )}
              >
                {item.selectedTopicCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
