import type { UseSchedulePeriodResult } from "../../../hooks/useSchedulePeriod";
import { CalendarMonth } from "./calendar-month";

interface DualCalendarProps {
  schedule: UseSchedulePeriodResult;
}

export function DualCalendar({ schedule }: DualCalendarProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CalendarMonth
        month={schedule.leftMonth}
        range={schedule.range}
        onSelectDay={schedule.onSelectDay}
        nav={{ direction: "prev", onClick: () => schedule.navigateMonth(-1) }}
      />
      <CalendarMonth
        month={schedule.rightMonth}
        range={schedule.range}
        onSelectDay={schedule.onSelectDay}
        nav={{ direction: "next", onClick: () => schedule.navigateMonth(1) }}
      />
    </div>
  );
}
