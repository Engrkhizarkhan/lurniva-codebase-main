import { useState } from "react";
import { CREATE_PLAN_TOTAL_STEPS } from "../create-plan-types";

export type StepDirection = "forward" | "back";

export interface UseStepNavigationResult {
  currentStep: number;
  direction: StepDirection;
  /** Pass the current step's validity — a no-op when `canContinue` is false. */
  goNext: (canContinue: boolean) => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useStepNavigation(): UseStepNavigationResult {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<StepDirection>("forward");

  function goNext(canContinue: boolean) {
    if (!canContinue) return;
    setDirection("forward");
    setCurrentStep((step) => Math.min(CREATE_PLAN_TOTAL_STEPS.length, step + 1));
  }

  function goBack() {
    setDirection("back");
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  function goToStep(step: number) {
    setDirection(step >= currentStep ? "forward" : "back");
    setCurrentStep(Math.min(CREATE_PLAN_TOTAL_STEPS.length, Math.max(1, step)));
  }

  return {
    currentStep,
    direction,
    goNext,
    goBack,
    goToStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === CREATE_PLAN_TOTAL_STEPS.length,
  };
}
