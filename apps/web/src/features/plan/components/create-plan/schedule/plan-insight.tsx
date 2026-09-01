import type { UseSchedulePeriodResult } from "../../../hooks/useSchedulePeriod";

interface PlanInsightProps {
  schedule: UseSchedulePeriodResult;
}

export function PlanInsight({ schedule }: PlanInsightProps) {
  if (!schedule.hasFullRange) return null;

  return (
    <div className="rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
      {schedule.dayCount} study day{schedule.dayCount === 1 ? "" : "s"} selected ·{" "}
      {schedule.totalHours} total study hours
    </div>
  );
}
