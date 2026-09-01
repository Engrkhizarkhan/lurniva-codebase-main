import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "~/utils/supabase/client";

export function useSignOut() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signOut = async () => {
    setIsSubmitting(true);
    await supabase.auth.signOut();
    setIsSubmitting(false);
    navigate({ to: "/sign-in" });
  };

  return { signOut, isSubmitting };
}
