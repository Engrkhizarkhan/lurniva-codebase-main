import { useContext } from "react";
import { OnboardingContext } from "../context/OnboardingContext.js";

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboardingContext must be used within an OnboardingProvider",
    );
  }
  return context;
}
