import { createFileRoute } from "@tanstack/react-router";
import { AcademicStepForm } from "~/features/onboarding/components/AcademicStepForm";
import { OnboardingSidePanel } from "~/shared/components/OnboardingSidePanel";
import { OnboardingSplitCard } from "~/shared/components/OnboardingSplitCard";

export const Route = createFileRoute("/onboarding/academic")({
  component: AcademicPage,
});

function AcademicPage() {
  return (
    <OnboardingSplitCard
      currentStep={3}
      totalSteps={[
        { label: "", count: 1 },
        { label: "", count: 2 },
        { label: "", count: 3 },
      ]}
      sidePanel={
        <OnboardingSidePanel
          heading="Learn your way, achieve your best"
          subtitle="We'll customize everything just for you."
          imagePlaceholder="Study desk"
        />
      }
    >
      <AcademicStepForm />
    </OnboardingSplitCard>
  );
}
