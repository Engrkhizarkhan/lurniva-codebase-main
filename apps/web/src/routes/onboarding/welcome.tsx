import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "~/features/onboarding/components/WelcomeScreen";

export const Route = createFileRoute("/onboarding/welcome")({
  component: WelcomeScreen,
});
