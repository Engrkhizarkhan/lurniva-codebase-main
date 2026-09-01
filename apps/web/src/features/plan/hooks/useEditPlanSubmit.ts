import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authFetch } from "~/shared/lib/api-client";
import type { CreatePlanDraft } from "../create-plan-types";
import type { Plan } from "../types";
import { getEditPlanDraftStorageKey } from "../lib/plan-draft";

export interface UseEditPlanSubmitResult {
  submit: (planId: string, draft: CreatePlanDraft) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function useEditPlanSubmit(): UseEditPlanSubmitResult {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(planId: string, draft: CreatePlanDraft) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authFetch<Plan>(`/api/plans/${planId}`, {
        method: "PUT",
        body: JSON.stringify({ draft }),
      });
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      // Not resetDraft(): that would restore the pre-edit snapshot this
      // provider was seeded with, not clear it. Removing the key outright
      // means the next visit reseeds fresh from the just-saved plan.
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(getEditPlanDraftStorageKey(planId));
      }
      navigate({ to: "/dashboard/plan" });
    } catch {
      setError("Something went wrong saving your changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error };
}
