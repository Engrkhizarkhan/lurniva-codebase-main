import { useState } from "react";
import { supabase } from "~/utils/supabase/client";

export function useGoogleSignIn() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsRedirecting(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setIsRedirecting(false);
    }
  };

  return { signInWithGoogle, isRedirecting, error };
}
