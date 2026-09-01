import { cn, Icon } from "@lurniva/ui";

export interface StepIndicatorProps {
  totalSteps: { label: string; count: number }[];
  currentStep: number;
  className?: string;
  /** When provided, each step dot becomes clickable (jump directly to that step) instead of a plain visual marker. */
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  totalSteps,
  currentStep,
  className,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {totalSteps.map((step, index) => {
        const isCompleted = step.count < currentStep;
        const isCurrent = step.count === currentStep;
        const isLast = index === totalSteps.length - 1;
        const dotClassName = cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-xs font-bold",
          isCompleted && "bg-primary text-text-on-primary",
          isCurrent && "bg-secondary text-text-on-primary",
          !isCompleted && !isCurrent && "bg-sand-300 text-text-muted",
        );
        const dotContent = isCompleted ? (
          <Icon name="check" size={14} strokeWidth={3} />
        ) : (
          step.count
        );

        const labelClassName = cn(
          "mt-1.5 whitespace-nowrap text-center text-xs font-medium",
          isCurrent ? "text-text-heading" : "text-text-muted",
        );

        return (
          <div
            key={step.count}
            className="flex flex-1 items-start last:flex-none"
          >
            {/* Fixed-width column matching the dot's own size (size-6 = 24px) so the
                label centers on the dot itself, not on the dot+connector-line row. */}
            <div className="flex w-6 shrink-0 flex-col items-center">
              {onStepClick ? (
                <button
                  type="button"
                  aria-label={`Go to step ${step.count}: ${step.label}`}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => onStepClick(step.count)}
                  className={cn(dotClassName, "cursor-pointer")}
                >
                  {dotContent}
                </button>
              ) : (
                <div className={dotClassName}>{dotContent}</div>
              )}
              <span className={labelClassName}>{step.label}</span>
            </div>
            {!isLast ? (
              // h-6 matches the dot's own height so the line centers on the dot, not on the taller dot+label column.
              <div className="flex h-6 flex-1 items-center">
                <div
                  className={cn(
                    "h-0.5 w-full",
                    isCompleted ? "bg-primary" : "bg-border-subtle",
                  )}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
