import { Button } from "@lurniva/ui";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn.js";
import { FcGoogle } from "react-icons/fc";

export function GoogleSignUpButton({ isSignup }: { isSignup: boolean }) {
  const { signInWithGoogle, isRedirecting } = useGoogleSignIn();

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      disabled={isRedirecting}
      onClick={signInWithGoogle}
    >
      <FcGoogle size={24} />
      {isRedirecting
        ? "Redirecting…"
        : `${isSignup ? "Sign up" : "Sign in"} with google`}
    </Button>
  );
}
