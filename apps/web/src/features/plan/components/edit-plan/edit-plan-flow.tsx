import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { CREATE_PLAN_TOTAL_STEPS } from "../../create-plan-types";
import { useBasicInfoForm } from "../../hooks/useBasicInfoForm";
import { useCatalog } from "../../hooks/useCatalog";
import { useEditPlanDraft } from "../../hooks/useEditPlanDraft";
import { useEditPlanSubmit } from "../../hooks/useEditPlanSubmit";
import { useSchedulePeriod } from "../../hooks/useSchedulePeriod";
import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useStudyContentSelection } from "../../hooks/useStudyContentSelection";
import { useLibrarySelection } from "../../hooks/useLibrarySelection";
import { useTimelineAssignment } from "../../hooks/useTimelineAssignment";
import type { StepCopy } from "../create-plan/step-copy";
import { STEP_COPY as SHARED_STEP_COPY } from "../create-plan/step-copy";
import { StepFooter } from "../create-plan/step-footer";
import { StepShell } from "../create-plan/step-shell";
import { StepAssignDays } from "../create-plan/steps/step-assign-days";
import { StepBasicInfo } from "../create-plan/steps/step-basic-info";
import { StepReview } from "../create-plan/steps/step-review";
import { StepSchedule } from "../create-plan/steps/step-schedule";
import { StepStudyContent } from "../create-plan/steps/step-study-content";

const STEP_COPY: Record<number, StepCopy> = {
  ...SHARED_STEP_COPY,
  5: {
    headline: "Review your changes",
    supportingCopy: "Take a quick look before you save. You can jump back to any step to adjust it.",
    wide: false,
  },
};

interface EditPlanFlowProps {
  planId: string;
}

export function EditPlanFlow({ planId }: EditPlanFlowProps) {
  const catalog = useCatalog();
  const { draft, setBasicInfo, setContent, setSchedule, setAssignment } =
    useEditPlanDraft();
  const nav = useStepNavigation();

  const basicInfoForm = useBasicInfoForm(draft.basicInfo, setBasicInfo);
  const content = useStudyContentSelection({
    subjects: catalog.subjects,
    draft: draft.content,
    onChange: (content) => setContent({ ...draft.content, ...content }),
  });
  const library = useLibrarySelection({
    selectedIds: draft.content.libraryItemIds ?? [],
    onChange: (libraryItemIds) =>
      setContent({ ...draft.content, libraryItemIds }),
  });
  const schedule = useSchedulePeriod({
    draft: draft.schedule,
    onChange: setSchedule,
    dailyStudyHours: draft.basicInfo.dailyStudyHours ?? null,
  });
  const timeline = useTimelineAssignment({
    subjects: catalog.subjects,
    libraryItems: library.items,
    content: draft.content,
    schedule: draft.schedule,
    assignment: draft.assignment,
    onChange: setAssignment,
  });
  const submit = useEditPlanSubmit();

  if (catalog.status === "loading") {
    return (
      <div className="mx-auto grid max-w-2xl gap-3 px-6 py-10 md:px-10">
        <SkeletonLoading className="h-6 w-48" />
        <SkeletonLoading className="h-40 w-full" />
        <SkeletonLoading className="h-40 w-full" />
      </div>
    );
  }

  if (catalog.status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        <ErrorState
          title="We couldn't load your subjects"
          description="Something went wrong loading the study catalog."
          onAction={catalog.refetch}
        />
      </div>
    );
  }

  function canContinueFromStep(step: number): boolean {
    switch (step) {
      case 1:
        return basicInfoForm.isValid;
      case 2:
        return content.selectedTopicsCount > 0 || library.selectedCount > 0;
      case 3:
        return schedule.hasFullRange;
      case 4:
        return (
          timeline.dayCount > 0 &&
          (timeline.days.some((day) => day.assignments.length > 0) ||
            library.selectedCount > 0)
        );
      default:
        return true;
    }
  }

  const canContinue = canContinueFromStep(nav.currentStep);

  function handleSaveExit() {
    void submit.submit(planId, draft);
  }

  function handleNext() {
    if (nav.currentStep === CREATE_PLAN_TOTAL_STEPS.length) {
      handleSaveExit();
      return;
    }
    nav.goNext(canContinue);
  }

  const copy = STEP_COPY[nav.currentStep] ?? { headline: "", supportingCopy: "", wide: false };

  return (
    <StepShell
      currentStep={nav.currentStep}
      direction={nav.direction}
      headline={copy.headline}
      supportingCopy={copy.supportingCopy}
      wide={copy.wide}
      onStepClick={nav.goToStep}
      footer={
        <StepFooter
          onBack={nav.goBack}
          onNext={handleNext}
          canContinue={canContinue}
          isFirstStep={nav.isFirstStep}
          nextLabel={nav.isLastStep ? "Save Changes" : "Save & Continue"}
          isSubmitting={submit.isSubmitting}
          submittingLabel="Saving your changes…"
          onSaveExit={nav.isLastStep ? undefined : handleSaveExit}
        />
      }
    >
      {nav.currentStep === 1 ? <StepBasicInfo form={basicInfoForm} /> : null}
      {nav.currentStep === 2 ? (
        <StepStudyContent content={content} library={library} />
      ) : null}
      {nav.currentStep === 3 ? <StepSchedule schedule={schedule} /> : null}
      {nav.currentStep === 4 ? (
        <StepAssignDays
          subjects={catalog.subjects}
          libraryItems={library.items}
          timeline={timeline}
          librarySelectedCount={library.selectedCount}
        />
      ) : null}
      {nav.currentStep === 5 ? (
        <StepReview
          draft={draft}
          subjects={catalog.subjects}
          libraryItems={library.items}
          days={timeline.days}
          totalTopicsSelected={content.selectedTopicsCount}
          restDayCount={timeline.restDayCount}
          librarySelectedCount={library.selectedCount}
          submitError={submit.error}
          bannerText="Everything looks good. Your changes are ready to save."
        />
      ) : null}
    </StepShell>
  );
}
