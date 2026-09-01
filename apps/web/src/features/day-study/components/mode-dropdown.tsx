import { useCallback, useState } from "react";
import { FloatingIndicator, Tabs } from "@mantine/core";
import { BookOpen, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@lurniva/ui";

export type StudyMode = "learning" | "assessment";

const MODES: {
  value: StudyMode;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    value: "learning",
    label: "Learning",
    hint: "Study by asking",
    icon: BookOpen,
  },
  {
    value: "assessment",
    label: "Assessment",
    hint: "Test yourself",
    icon: Target,
  },
];

interface ModeDropdownProps {
  value?: StudyMode;
  onChange?: (value: StudyMode) => void;
  /** Renders the "Study mode" caption above the control. */
  showLabel?: boolean;
  className?: string;
}

/**
 * The Learning/Assessment switch, as a pill segmented control: a sunken track
 * with the selected mode carried on a solid dark pill. The choice is stated by
 * the pill, the icon and the ink weight, so it never depends on colour alone.
 */
const ModeDropdown = ({
  value: controlledValue,
  onChange,
  showLabel = false,
  className,
}: ModeDropdownProps = {}) => {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [internalValue, setInternalValue] = useState<StudyMode>("learning");
  const value = controlledValue ?? internalValue;

  const [controlsRefs, setControlsRefs] = useState<
    Record<StudyMode, HTMLButtonElement | null>
  >({ learning: null, assessment: null });

  const setLearningRef = useCallback((node: HTMLButtonElement | null) => {
    setControlsRefs((prev) =>
      prev.learning === node ? prev : { ...prev, learning: node },
    );
  }, []);
  const setAssessmentRef = useCallback((node: HTMLButtonElement | null) => {
    setControlsRefs((prev) =>
      prev.assessment === node ? prev : { ...prev, assessment: node },
    );
  }, []);
  const refSetters: Record<
    StudyMode,
    (node: HTMLButtonElement | null) => void
  > = {
    learning: setLearningRef,
    assessment: setAssessmentRef,
  };

  const handleChange = (next: string | null) => {
    if (!next) return;
    const mode = next as StudyMode;
    if (onChange) {
      onChange(mode);
    } else {
      setInternalValue(mode);
    }
  };

  const active = MODES.find((mode) => mode.value === value) ?? MODES[0]!;

  return (
    <div className={cn("grid gap-1.5", className)}>
      {showLabel ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
          Study mode
        </span>
      ) : null}

      <Tabs variant="none" value={value} onChange={handleChange}>
        <Tabs.List
          ref={setRootRef}
          aria-label="Study mode"
          className="relative w-max rounded-pill bg-surface-sunken p-1"
        >
          {MODES.map((mode) => (
            <Tabs.Tab
              key={mode.value}
              value={mode.value}
              ref={refSetters[mode.value]}
              className={cn(
                "relative z-1! flex h-9! items-center gap-2! rounded-pill! px-3.5! py-0! text-[13px]! font-semibold!",
                "text-text-muted! transition-colors duration-150",
                "data-active:text-cream-100!",
              )}
            >
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <mode.icon size={14} strokeWidth={1.8} />
                {mode.label}
              </span>
            </Tabs.Tab>
          ))}

          <FloatingIndicator
            target={controlsRefs[value]}
            parent={rootRef}
            className="rounded-pill! bg-surface-inverse shadow-sm"
          />
        </Tabs.List>
      </Tabs>

      {showLabel ? (
        <span className="text-xs text-text-muted">{active.hint}</span>
      ) : null}
    </div>
  );
};

export default ModeDropdown;
