import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { SignInInput } from "@lurniva/validation";
import { supabase } from "~/utils/supabase/client";

export function useSignIn() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (input: SignInInput) => {
    setIsSubmitting(true);
    setError(null);
    const { error: authError } =
      await supabase.auth.signInWithPassword(input);
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate({ to: "/" });
  };

  return { signIn, isSubmitting, error };
}
