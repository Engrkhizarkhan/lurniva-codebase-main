import { useState } from "react";
import type { SchedulePeriodDraft } from "../create-plan-types";
import {
  addMonths,
  fromISODate,
  pickRangeDay,
  quickRange,
  startOfMonth,
  toISODate,
} from "../lib/calendar";
import type { DateRange } from "../lib/calendar";
import { getDurationDays } from "../types";

export type QuickRangeOption = 7 | 14 | 30;

interface UseSchedulePeriodArgs {
  draft: Partial<SchedulePeriodDraft>;
  onChange: (schedule: Partial<SchedulePeriodDraft>) => void;
  dailyStudyHours: number | null;
}

export interface UseSchedulePeriodResult {
  range: DateRange;
  leftMonth: Date;
  rightMonth: Date;
  navigateMonth: (delta: number) => void;
  onSelectDay: (day: Date) => void;
  applyQuickRange: (days: QuickRangeOption) => void;
  startCustomRange: () => void;
  activeQuickRange: QuickRangeOption | null;
  dayCount: number;
  totalHours: number;
  hasFullRange: boolean;
  feedbackHeadline: string;
  feedbackSupport: string;
}

export function useSchedulePeriod({
  draft,
  onChange,
  dailyStudyHours,
}: UseSchedulePeriodArgs): UseSchedulePeriodResult {
  const [leftMonth, setLeftMonth] = useState(() => startOfMonth(new Date()));
  const [activeQuickRange, setActiveQuickRange] = useState<QuickRangeOption | null>(
    null,
  );

  const range: DateRange = {
    start: draft.startDate ? fromISODate(draft.startDate) : null,
    end: draft.endDate ? fromISODate(draft.endDate) : null,
  };

  const rightMonth = addMonths(leftMonth, 1);

  function navigateMonth(delta: number) {
    setLeftMonth((current) => addMonths(current, delta));
  }

  function onSelectDay(day: Date) {
    setActiveQuickRange(null);
    const next = pickRangeDay(range, day);
    onChange({
      startDate: next.start ? toISODate(next.start) : null,
      endDate: next.end ? toISODate(next.end) : null,
    });
  }

  function applyQuickRange(days: QuickRangeOption) {
    const next = quickRange(days);
    setActiveQuickRange(days);
    setLeftMonth(startOfMonth(fromISODate(next.startDate)));
    onChange(next);
  }

  function startCustomRange() {
    setActiveQuickRange(null);
    onChange({ startDate: null, endDate: null });
  }

  const hasFullRange = Boolean(draft.startDate && draft.endDate);
  const dayCount = hasFullRange
    ? getDurationDays(draft.startDate as string, draft.endDate as string)
    : 0;
  const totalHours = hasFullRange ? Math.round(dayCount * (dailyStudyHours ?? 0)) : 0;

  const feedbackHeadline = hasFullRange
    ? `You've selected ${dayCount} day${dayCount === 1 ? "" : "s"}.`
    : "Pick a start and end date to build your timeline.";
  const feedbackSupport = hasFullRange
    ? "That's enough time to organize your selected topics into a focused study plan."
    : "Use a quick range or select dates on the calendar below.";

  return {
    range,
    leftMonth,
    rightMonth,
    navigateMonth,
    onSelectDay,
    applyQuickRange,
    startCustomRange,
    activeQuickRange,
    dayCount,
    totalHours,
    hasFullRange,
    feedbackHeadline,
    feedbackSupport,
  };
}
