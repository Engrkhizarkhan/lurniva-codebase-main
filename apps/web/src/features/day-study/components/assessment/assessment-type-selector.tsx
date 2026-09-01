import { CheckCircle2 } from "lucide-react";
import { cn } from "@lurniva/ui";
import { getAssessmentFeatures } from "../../constants/features";
import type { AssessmentFeature } from "../../types";

interface AssessmentTypeSelectorProps {
  value: AssessmentFeature | null;
  disabled?: boolean;
  onChange: (feature: AssessmentFeature) => void;
}

/**
 * Picks what kind of practice to run. Each card states its purpose once —
 * icon, name, one line — and the selected card is marked with a filled check
 * as well as a border, so the choice never depends on colour alone.
 */
export function AssessmentTypeSelector({
  value,
  disabled = false,
  onChange,
}: AssessmentTypeSelectorProps) {
  return (
    <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
      <legend className="sr-only">Assessment type</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {getAssessmentFeatures().map((feature) => {
          const selected = feature.id === value;
          return (
            <button
              key={feature.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(feature.id as AssessmentFeature)}
              className={cn(
                "flex flex-col gap-2.5 rounded-2xl border p-4.5 text-left shadow-sm transition-all duration-150",
                "hover:shadow-md",
                "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-forest-800 bg-accent/18"
                  : "border-border-subtle bg-white",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    selected ? "bg-forest-800/12" : "bg-surface-sunken",
                  )}
                >
                  <feature.icon size={18} className="text-forest-800" />
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-base font-bold text-forest-900">
                  {feature.label}
                </span>
                {selected ? (
                  <CheckCircle2 size={18} className="shrink-0 text-forest-800" />
                ) : null}
              </span>
              <span className="text-[13px] leading-relaxed text-text-muted">
                {feature.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
