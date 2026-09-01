import { createContext } from "react";
import type { ReactNode } from "react";
import type {
  OnboardingAcademicInput,
  OnboardingProfileInput,
} from "../validation/index.js";
import { useSessionStorageState } from "~/shared/hooks/useSessionStorageState";

export interface OnboardingDraft {
  profile: Partial<OnboardingProfileInput>;
  academic: Partial<OnboardingAcademicInput>;
}

export interface OnboardingContextValue {
  draft: OnboardingDraft;
  setProfile: (profile: OnboardingProfileInput) => void;
  setAcademic: (academic: OnboardingAcademicInput) => void;
}

const defaultDraft: OnboardingDraft = { profile: {}, academic: {} };

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useSessionStorageState<OnboardingDraft>(
    "lurniva-onboarding-draft",
    defaultDraft,
  );

  const setProfile = (profile: OnboardingProfileInput) =>
    setDraft((previous) => ({ ...previous, profile }));
  const setAcademic = (academic: OnboardingAcademicInput) =>
    setDraft((previous) => ({ ...previous, academic }));

  return (
    <OnboardingContext.Provider value={{ draft, setProfile, setAcademic }}>
      {children}
    </OnboardingContext.Provider>
  );
}
