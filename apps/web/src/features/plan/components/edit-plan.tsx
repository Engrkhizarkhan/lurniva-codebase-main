import { useNavigate } from "@tanstack/react-router";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { EditPlanProvider } from "../context/EditPlanContext";
import { usePlanLoader } from "../hooks/usePlanLoader";
import { EditPlanFlow } from "./edit-plan/edit-plan-flow";

interface EditPlanProps {
  planId: string;
}

export function EditPlan({ planId }: EditPlanProps) {
  const navigate = useNavigate();
  const { plan, status, refetch } = usePlanLoader(planId);

  function goToPlans() {
    navigate({ to: "/dashboard/plan" });
  }

  if (status === "loading") {
    return (
      <div className="mx-auto grid max-w-2xl gap-3 px-6 py-10 md:px-10">
        <SkeletonLoading className="h-6 w-48" />
        <SkeletonLoading className="h-40 w-full" />
        <SkeletonLoading className="h-40 w-full" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        <EmptyState
          title="Plan not found"
          description="This study plan may have been deleted."
          actionLabel="Back to plans"
          onAction={goToPlans}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        <ErrorState
          title="We couldn't load this plan"
          description="Something went wrong loading your study plan."
          actionLabel="Try again"
          onAction={refetch}
        />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <EditPlanProvider planId={planId} initialPlan={plan}>
      <EditPlanFlow planId={planId} />
    </EditPlanProvider>
  );
}

export default EditPlan;
