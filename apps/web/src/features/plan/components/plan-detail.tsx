import { useNavigate } from "@tanstack/react-router";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { usePlanLoader } from "../hooks/usePlanLoader";
import { getTodaysStudyDayNumber } from "../lib/plan-progress";
import { AiAssistantBanner } from "./plan-detail/ai-assistant-banner";
import { PlanDayList } from "./plan-detail/plan-day-list";
import { PlanDetailHeader } from "./plan-detail/plan-detail-header";
import { PlanProgressSummary } from "./plan-detail/plan-progress-summary";

interface PlanDetailProps {
  planId: string;
}

export function PlanDetail({ planId }: PlanDetailProps) {
  const navigate = useNavigate();
  const { plan, status, refetch } = usePlanLoader(planId);

  function goToPlans() {
    navigate({ to: "/dashboard/plan" });
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonLoading className="h-6 w-40" />
        <SkeletonLoading className="h-28 w-full" />
        <SkeletonLoading className="h-32 w-full" />
        <SkeletonLoading className="h-64 w-full" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <EmptyState
        title="Plan not found"
        description="This study plan may have been deleted."
        actionLabel="Back to plans"
        onAction={goToPlans}
      />
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="We couldn't load this plan"
        description="Something went wrong loading your study plan."
        actionLabel="Try again"
        onAction={refetch}
      />
    );
  }

  if (!plan) return null;

  const days = plan.days ?? [];
  const todaysDayNumber = getTodaysStudyDayNumber(days);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PlanDetailHeader plan={plan} todaysDayNumber={todaysDayNumber} />
      <PlanProgressSummary days={days} />
      <PlanDayList planId={plan.id} days={days} />
      <AiAssistantBanner />
    </div>
  );
}

export default PlanDetail;
