import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { SignUpInput } from "@lurniva/validation";
import type { ApiResult } from "@lurniva/types";
import { supabase } from "~/utils/supabase/client";

type Status = "idle" | "check-email";

export function useSignUp() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState<string | null>(null);

  const signUp = async (input: SignUpInput) => {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = (await response.json()) as ApiResult<{ status: string }>;

    if (!result.success) {
      setIsSubmitting(false);
      if (result.error.code === "ALREADY_REGISTERED") {
        setError("This email is already registered. Try signing in instead.");
      } else if (result.error.code === "RATE_LIMITED") {
        setError("Please wait before requesting another verification email.");
      } else {
        setError(result.error.message);
      }
      return;
    }

    // TEMPORARY: while email verification is bypassed (see ~/lib/verification.ts),
    // the account comes back already confirmed — sign in directly and skip the
    // "check your email" step.
    if (result.data.status === "verified") {
      const { error: signInError } = await supabase.auth.signInWithPassword(input);
      setIsSubmitting(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate({ to: "/onboarding/profile" });
      return;
    }

    setIsSubmitting(false);
    setEmail(input.email);
    setStatus("check-email");
  };

  return { signUp, isSubmitting, error, status, email };
}
