import { useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@lurniva/ui";
import { StepIndicator } from "~/shared/components/StepIndicator";
import { CREATE_PLAN_TOTAL_STEPS } from "../../create-plan-types";
import type { StepDirection } from "../../hooks/useStepNavigation";
import { StepTransition } from "./step-transition";

interface StepShellProps {
  currentStep: number;
  direction: StepDirection;
  headline: string;
  supportingCopy: string;
  children: ReactNode;
  footer: ReactNode;
  /** Wider content area for steps with a two-column layout (Study Content, Assign Days). */
  wide?: boolean;
  /** When provided, the step indicator becomes clickable — used by the edit flow to jump directly between steps. */
  onStepClick?: (step: number) => void;
}

export function StepShell({
  currentStep,
  direction,
  headline,
  supportingCopy,
  children,
  footer,
  wide = false,
  onStepClick,
}: StepShellProps) {
  // Whatever scroll container the step content actually lives in (main, a
  // wrapper div, ...), scrollIntoView walks up and scrolls every scrollable
  // ancestor.
  const topRef = useRef<HTMLDivElement>(null);
  function scrollToTop() {
    topRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="min-h-screen bg-surface-canvas py-10">
      <div
        className={cn(
          "mx-auto px-6 md:px-10",
          wide ? "max-w-5xl" : "max-w-2xl",
        )}
      >
        <div ref={topRef} />
        <StepIndicator
          totalSteps={CREATE_PLAN_TOTAL_STEPS}
          currentStep={currentStep}
          onStepClick={onStepClick}
          className="mb-8"
        />

        <header>
          <h1 className="text-2xl font-bold text-text-heading">{headline}</h1>
          <p className="mt-1.5 text-sm text-text-muted">{supportingCopy}</p>
        </header>

        <div className="mt-6">
          <StepTransition
            stepKey={currentStep}
            direction={direction}
            onExited={scrollToTop}
          >
            {children}
          </StepTransition>
        </div>

        {footer}
      </div>
    </div>
  );
}
