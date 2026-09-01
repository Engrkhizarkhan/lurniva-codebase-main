import { Button } from "@lurniva/ui";
import { useResendVerification } from "../hooks/useResendVerification.js";

function CheckEmailPanel({ email }: { email: string }) {
  const { resend, isSubmitting, error, cooldownSeconds } =
    useResendVerification();

  return (
    <div className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl font-bold text-text-heading">
          Check your email
        </h2>
        <p className="text-sm text-text-muted">
          We sent a verification link to <strong>{email}</strong>. Click it to
          finish setting up your account.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        fullWidth
        disabled={isSubmitting || cooldownSeconds > 0}
        onClick={() => resend(email)}
      >
        {cooldownSeconds > 0
          ? `Resend email (${cooldownSeconds}s)`
          : "Resend email"}
      </Button>
    </div>
  );
}

export default CheckEmailPanel;
