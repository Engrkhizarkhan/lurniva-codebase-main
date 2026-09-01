import { CalendarRange, Rocket, Target, TrendingUp } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { UseSchedulePeriodResult } from "../../../hooks/useSchedulePeriod";

const QUICK_OPTIONS = [
  { days: 7 as const, title: "Next 7 Days", description: "Short focused plan.", icon: Rocket },
  {
    days: 14 as const,
    title: "Next 14 Days",
    description: "Ideal for short-term goals.",
    icon: Target,
  },
  {
    days: 30 as const,
    title: "Next 30 Days",
    description: "Build a monthly plan.",
    icon: TrendingUp,
  },
];

interface QuickActionsProps {
  schedule: UseSchedulePeriodResult;
}

export function QuickActions({ schedule }: QuickActionsProps) {
  const isCustomActive = schedule.activeQuickRange === null;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      <button
        type="button"
        onClick={schedule.startCustomRange}
        className={cn(
          "flex flex-col items-start gap-1.5 rounded-xl border bg-surface-raised p-3.5 text-left transition-colors duration-150",
          isCustomActive
            ? "border-primary"
            : "border-border-subtle hover:bg-surface-sunken",
        )}
      >
        <CalendarRange size={16} className="text-primary" />
        <span className="text-sm font-bold text-text-heading">Custom Range</span>
        <span className="text-xs text-text-muted">
          Select your own start and end dates.
        </span>
      </button>
      {QUICK_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = schedule.activeQuickRange === option.days;
        return (
          <button
            key={option.days}
            type="button"
            onClick={() => schedule.applyQuickRange(option.days)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-xl border bg-surface-raised p-3.5 text-left transition-colors duration-150",
              selected
                ? "border-primary"
                : "border-border-subtle hover:bg-surface-sunken",
            )}
          >
            <Icon size={16} className="text-primary" />
            <span className="text-sm font-bold text-text-heading">{option.title}</span>
            <span className="text-xs text-text-muted">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
