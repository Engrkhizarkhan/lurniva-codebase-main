import { cn, Icon } from "@lurniva/ui";
import type { CurriculumOption } from "../validation/index.js";

export interface CurriculumOptionCardProps {
  option: CurriculumOption;
  selected: boolean;
  onSelect: (id: CurriculumOption["id"]) => void;
}

const toneBgClasses: Record<CurriculumOption["tone"], string> = {
  primary: "bg-primary",
  teacher: "bg-role-teacher",
};

export function CurriculumOptionCard({
  option,
  selected,
  onSelect,
}: CurriculumOptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      className={cn(
        "relative grid flex-1 gap-2.5 rounded-card border bg-surface-card p-4 text-left",
        selected ? "border-[1.5px] border-border-strong" : "border-border-subtle",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md",
          toneBgClasses[option.tone],
        )}
      >
        <Icon name={option.icon} size={20} color="var(--color-cream-100)" />
      </div>
      <div className="grid gap-0.5">
        <span className="text-[15px] font-semibold text-text-heading">
          {option.label}
        </span>
        <span className="text-xs text-text-muted">{option.subtitle}</span>
      </div>
      {selected ? (
        <span className="absolute -right-2 -top-2 flex h-[22px] w-[22px] items-center justify-center rounded-pill bg-accent shadow-sm">
          <Icon
            name="check"
            size={12}
            strokeWidth={3}
            color="var(--text-on-accent)"
          />
        </span>
      ) : null}
    </button>
  );
}
