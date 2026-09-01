import type { UseSchedulePeriodResult } from "../../../hooks/useSchedulePeriod";
import { DualCalendar } from "../schedule/dual-calendar";
import { PlanInsight } from "../schedule/plan-insight";
import { QuickActions } from "../schedule/quick-actions";

interface StepScheduleProps {
  schedule: UseSchedulePeriodResult;
}

export function StepSchedule({ schedule }: StepScheduleProps) {
  return (
    <div className="grid gap-5">
      <QuickActions schedule={schedule} />
      <DualCalendar schedule={schedule} />
      <div>
        <p className="text-sm font-semibold text-text-heading">
          {schedule.feedbackHeadline}
        </p>
        <p className="mt-0.5 text-sm text-text-muted">{schedule.feedbackSupport}</p>
      </div>
      <PlanInsight schedule={schedule} />
    </div>
  );
}
