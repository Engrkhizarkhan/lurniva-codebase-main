// ---------------------------------------------------------------------------
// Pure date helpers shared by the Schedule step (dual calendar panels, quick
// ranges) and the Assign Days step (timeline day/date math).
// ---------------------------------------------------------------------------

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local-timezone-safe ISO date (YYYY-MM-DD) — avoids the UTC-shift bug of `toISOString().slice(0,10)`. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromISODate(iso: string): Date {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

export function addDaysISO(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMonthGrid(monthDate: Date): Date[] {
  const firstOfMonth = startOfMonth(monthDate);
  const leadingDays = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth(),
    1 - leadingDays,
  );
  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      ),
  );
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(fromISODate(iso));
}

const weekdayShortFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** e.g. "Thu, 22 May" — used for Step 4 duration/day labels. */
export function formatWeekdayShort(iso: string): string {
  return weekdayShortFormatter.format(fromISODate(iso));
}

// ---------------------------------------------------------------------------
// Range selection (dual calendar, click-to-pick-start-then-end)
// ---------------------------------------------------------------------------

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export function pickRangeDay(current: DateRange, day: Date): DateRange {
  if (!current.start || (current.start && current.end)) {
    return { start: day, end: null };
  }
  return day < current.start
    ? { start: day, end: current.start }
    : { start: current.start, end: day };
}

/** Start = today, running for `days` consecutive days (inclusive). */
export function quickRange(days: number): { startDate: string; endDate: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days - 1);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}
