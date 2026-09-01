import { useMemo } from "react";
import { Select } from "@lurniva/ui";
import { cn } from "@lurniva/ui";

interface DurationDropdownProps {
  durationDays: number;
  onChange: (days: number) => void;
  /** Caps the option list so a day near the end of the schedule can't offer durations that would run off it. */
  maxDays?: number;
  size?: "sm" | "md";
}

export function DurationDropdown({
  durationDays,
  onChange,
  maxDays = 14,
  size = "md",
}: DurationDropdownProps) {
  const options = useMemo(
    () =>
      Array.from({ length: Math.max(1, maxDays) }, (_, index) => index + 1).map(
        (days) => ({ value: String(days), label: `${days} day${days === 1 ? "" : "s"}` }),
      ),
    [maxDays],
  );

  return (
    <Select
      aria-label="Duration"
      options={options}
      value={String(durationDays)}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn(
        "rounded-lg font-medium",
        size === "sm" ? "h-8 w-20 px-2 text-xs" : "h-10 w-28 px-3 text-sm",
      )}
    />
  );
}
