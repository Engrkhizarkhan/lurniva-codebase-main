import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@lurniva/ui";
import { ASSESSMENT_BOUNDS, clampCount } from "../../lib/assessment-plan";
import type { AssessmentCountKey } from "../../lib/assessment-plan";

const chipClasses = (selected: boolean) =>
  cn(
    "flex h-11 min-w-14 items-center justify-center rounded-control border px-4",
    "text-[15px] font-semibold tabular-nums transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    selected
      ? "border-forest-900 bg-forest-900 text-cream-100"
      : "border-border-default bg-white text-forest-900 hover:bg-surface-sunken",
  );

interface CountPresetsProps {
  countKey: AssessmentCountKey;
  label: string;
  value: number;
  presets: number[];
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * How many questions to generate: presets for the common answers, plus a
 * custom value for everything else. The custom input holds the student's raw
 * keystrokes and only clamps on commit, so typing "1" on the way to "15" is
 * not rewritten under the cursor.
 */
export function CountPresets({
  countKey,
  label,
  value,
  presets,
  disabled = false,
  onChange,
}: CountPresetsProps) {
  const bounds = ASSESSMENT_BOUNDS[countKey];
  const [isCustom, setIsCustom] = useState(() => !presets.includes(value));
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // The parent can change the count on its own (switching assessment type
  // reloads the defaults). Catching that during render keeps the draft in step
  // without an effect that would re-render after paint.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(String(value));
    if (presets.includes(value)) setIsCustom(false);
  }

  function commitDraft() {
    const next = clampCount(countKey, Number(draft));
    setDraft(String(next));
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          disabled={disabled}
          aria-pressed={!isCustom && value === preset}
          onClick={() => {
            setIsCustom(false);
            onChange(preset);
          }}
          className={chipClasses(!isCustom && value === preset)}
        >
          {preset}
        </button>
      ))}

      <button
        type="button"
        disabled={disabled}
        aria-pressed={isCustom}
        onClick={() => setIsCustom(true)}
        className={chipClasses(isCustom)}
      >
        Custom
      </button>

      {isCustom ? (
        <input
          id={`count-${countKey}`}
          type="number"
          inputMode="numeric"
          min={bounds.min}
          max={bounds.max}
          value={draft}
          disabled={disabled}
          aria-label={`${label} — custom amount, ${bounds.min} to ${bounds.max}`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
            }
          }}
          className="h-11 w-24 rounded-control border border-border-strong bg-white px-3.5 text-[15px] font-semibold text-forest-900 focus-visible:outline-2 focus-visible:outline-border-focus disabled:opacity-60"
        />
      ) : null}
    </div>
  );
}

interface CountStepperProps {
  countKey: AssessmentCountKey;
  label: string;
  /** What this section actually tests, one line. */
  note: string;
  icon: LucideIcon;
  value: number;
  /** How much one press moves the count. */
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * One section of a mock exam. Sections are sized against each other rather
 * than picked from presets, so they get a stepper and stack into a single
 * exam-structure list.
 */
export function CountStepper({
  countKey,
  label,
  note,
  icon: Icon,
  value,
  step = 5,
  disabled = false,
  onChange,
}: CountStepperProps) {
  const bounds = ASSESSMENT_BOUNDS[countKey];

  return (
    <div className="flex items-center gap-3.5 rounded-lg bg-white px-3.5 py-3">
      <Icon size={17} className="shrink-0 text-forest-700" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-forest-900">
          {label}
        </span>
        <span className="truncate text-xs text-text-faint">{note}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || value <= bounds.min}
          aria-label={`Fewer ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(bounds.min, value - step))}
          className="flex size-8.5 items-center justify-center rounded-lg border border-border-default text-forest-900 transition-colors duration-150 hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={15} />
        </button>
        <span
          aria-live="polite"
          className="min-w-8.5 text-center text-base font-bold tabular-nums text-forest-900"
        >
          {value}
        </span>
        <button
          type="button"
          disabled={disabled || value >= bounds.max}
          aria-label={`More ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(bounds.max, value + step))}
          className="flex size-8.5 items-center justify-center rounded-lg border border-border-default text-forest-900 transition-colors duration-150 hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
