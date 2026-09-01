import { createFileRoute } from "@tanstack/react-router";
import { ProfileStepForm } from "~/features/onboarding/components/ProfileStepForm";
import { OnboardingSidePanel } from "~/shared/components/OnboardingSidePanel";
import { OnboardingSplitCard } from "~/shared/components/OnboardingSplitCard";

export const Route = createFileRoute("/onboarding/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <OnboardingSplitCard
      currentStep={2}
      totalSteps={[
        { label: "", count: 1 },
        { label: "", count: 2 },
        { label: "", count: 3 },
      ]}
      sidePanel={
        <OnboardingSidePanel
          heading="Personalized learning for your success"
          subtitle="We adapt lessons, topics and resources based on your curriculum."
          imagePlaceholder="Students collaborating"
        />
      }
    >
      <ProfileStepForm />
    </OnboardingSplitCard>
  );
}
