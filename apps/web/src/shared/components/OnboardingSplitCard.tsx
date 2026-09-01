import type { ReactNode } from "react";
import { StepIndicator } from "./StepIndicator.js";

export interface OnboardingSplitCardProps {
  currentStep: number;
  totalSteps: { label: string; count: number }[];
  sidePanel: ReactNode;
  children: ReactNode;
}

export function OnboardingSplitCard({
  currentStep,
  totalSteps,
  sidePanel,
  children,
}: OnboardingSplitCardProps) {
  return (
    <div className="flex w-full max-w-[760px] overflow-hidden rounded-card border border-border-subtle bg-surface-card shadow-sm">
      <div className="grid w-full gap-4.5 p-6 md:w-[440px] md:p-8">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-text-heading">
            Lurniva
          </span>
          <span className="text-xs text-text-faint">
            Step {currentStep} of {totalSteps.length}
          </span>
        </div>
        <StepIndicator totalSteps={totalSteps} currentStep={currentStep} />
        {children}
      </div>
      {sidePanel}
    </div>
  );
}
