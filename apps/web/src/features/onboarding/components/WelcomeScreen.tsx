import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button, Icon } from "@lurniva/ui";
import { fireSuccessConfetti } from "~/shared/lib/confetti";
import { ONBOARDING_JUST_COMPLETED_KEY } from "../constants.js";

export function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    fireSuccessConfetti();
    // Consume the flag: a later back-button/bookmark/reload visit to this
    // route should redirect to /dashboard like every other /onboarding/* step.
    sessionStorage.removeItem(ONBOARDING_JUST_COMPLETED_KEY);
  }, [navigate]);

  return (
    <div className="mx-auto grid max-w-sm justify-items-center gap-6 rounded-card bg-surface-inverse p-12 text-center shadow-sm">
      <span className="justify-self-start font-display text-lg font-extrabold text-cream-100">
        Lurniva
      </span>
      <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-pill bg-accent">
        <Icon
          name="check"
          size={48}
          strokeWidth={3}
          color="var(--text-on-accent)"
        />
      </div>
      <div className="grid gap-2">
        <h2 className="font-display text-[26px] font-bold text-cream-100">
          Welcome to Lurniva
        </h2>
        <p className="text-[15px] text-cream-100/80">
          We&apos;re happy to onboard you — let&apos;s get you learning.
        </p>
      </div>
      <Button
        variant="accent"
        fullWidth
        onClick={() => navigate({ to: "/dashboard", viewTransition: true })}
      >
        Go to dashboard
      </Button>
    </div>
  );
}
