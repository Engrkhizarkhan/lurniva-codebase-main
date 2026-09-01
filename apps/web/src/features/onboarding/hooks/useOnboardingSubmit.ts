import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ApiResult } from "@lurniva/types";
import { supabase } from "~/utils/supabase/client";
import { useOnboardingContext } from "./useOnboardingContext.js";
import type { OnboardingAcademicInput } from "../validation/index.js";
import { ONBOARDING_JUST_COMPLETED_KEY } from "../constants.js";

export function useOnboardingSubmit() {
  const navigate = useNavigate();
  const { draft } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `academic` is taken as a param rather than read from `draft.academic`
  // because the caller's `setAcademic(data)` (a state update) hasn't
  // necessarily flushed to this hook's own context read yet — passing it
  // directly avoids submitting a stale/empty academic draft on the first click.
  const submit = async (academic: OnboardingAcademicInput) => {
    setIsSubmitting(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token}`,
      },
      body: JSON.stringify({
        fullName: draft.profile.fullName,
        curriculum: draft.profile.curriculum,
        grade: academic.grade,
        schoolName: academic.schoolName,
      }),
    });
    const result = (await response.json()) as ApiResult<unknown>;
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }
    sessionStorage.setItem(ONBOARDING_JUST_COMPLETED_KEY, "1");
    navigate({ to: "/onboarding/welcome", viewTransition: true });
  };

  return { submit, isSubmitting, error };
}
