import { createFileRoute } from "@tanstack/react-router";
import { PlanDetail } from "~/features/plan/components/plan-detail";

export const Route = createFileRoute("/dashboard/plan/$planId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = Route.useParams();
  return <PlanDetail planId={planId} />;
}
