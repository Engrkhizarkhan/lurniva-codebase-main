import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { DateRange } from "../../../lib/calendar";
import { formatMonthLabel, getMonthGrid, isSameDay } from "../../../lib/calendar";

interface CalendarMonthProps {
  month: Date;
  range: DateRange;
  onSelectDay: (day: Date) => void;
  nav?: { direction: "prev" | "next"; onClick: () => void };
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function CalendarMonth({ month, range, onSelectDay, nav }: CalendarMonthProps) {
  const grid = useMemo(() => getMonthGrid(month), [month]);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <div className="flex items-center justify-between">
        {nav?.direction === "prev" ? (
          <button
            type="button"
            aria-label="Previous month"
            onClick={nav.onClick}
            className="flex size-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-sunken"
          >
            <ChevronLeft size={16} />
          </button>
        ) : (
          <span className="size-7" />
        )}
        <p className="text-sm font-bold text-text-heading">{formatMonthLabel(month)}</p>
        {nav?.direction === "next" ? (
          <button
            type="button"
            aria-label="Next month"
            onClick={nav.onClick}
            className="flex size-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-sunken"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <span className="size-7" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-text-faint">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
        {grid.map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const isStart = range.start !== null && isSameDay(day, range.start);
          const isEnd = range.end !== null && isSameDay(day, range.end);
          const inRange =
            range.start !== null &&
            range.end !== null &&
            day > range.start &&
            day < range.end;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!inMonth}
              onClick={() => onSelectDay(day)}
              className={cn(
                "mx-auto flex size-9 items-center justify-center rounded-full transition-colors duration-150",
                !inMonth
                  ? "cursor-default text-text-faint/50"
                  : isStart || isEnd
                    ? "bg-primary font-semibold text-text-on-primary"
                    : inRange
                      ? "bg-primary-soft text-text-heading"
                      : "text-text-body hover:bg-surface-sunken",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
