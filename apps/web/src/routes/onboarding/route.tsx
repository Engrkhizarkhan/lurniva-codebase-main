import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { OnboardingProvider } from "~/features/onboarding/context/OnboardingContext";
import { ONBOARDING_JUST_COMPLETED_KEY } from "~/features/onboarding/constants";
import { requireAuthenticated } from "~/shared/lib/route-guards";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ location }) => {
    const { isOnboarded } = await requireAuthenticated();
    // An onboarded user gets bounced to /dashboard from every /onboarding/*
    // route — including /onboarding/welcome — with exactly one exception:
    // the instant right after finishing, when useOnboardingSubmit sets this
    // flag before navigating there so the celebration screen can render.
    // WelcomeScreen clears it on mount, so a later back-button/bookmark/
    // reload visit to /onboarding/welcome redirects away like any other step.
    const justCompleted =
      location.pathname === "/onboarding/welcome" &&
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(ONBOARDING_JUST_COMPLETED_KEY) === "1";
    if (isOnboarded && !justCompleted) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-8">
        <Outlet />
      </div>
    </OnboardingProvider>
  );
}
