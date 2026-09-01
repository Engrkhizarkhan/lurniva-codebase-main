import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { fireSuccessConfetti } from "~/shared/lib/confetti";
import { authFetch } from "~/shared/lib/api-client";
import type { CreatePlanDraft } from "../create-plan-types";
import type { Plan } from "../types";
import { useCreatePlanDraft } from "./useCreatePlanDraft";

export interface UseCreatePlanSubmitResult {
  submit: (draft: CreatePlanDraft) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function useCreatePlanSubmit(): UseCreatePlanSubmitResult {
  const navigate = useNavigate();
  const { resetDraft } = useCreatePlanDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(draft: CreatePlanDraft) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authFetch<Plan>("/api/plans", {
        method: "POST",
        body: JSON.stringify({ draft }),
      });
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      fireSuccessConfetti();
      resetDraft();
      navigate({ to: "/dashboard/plan" });
    } catch {
      setError("Something went wrong creating your plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error };
}
