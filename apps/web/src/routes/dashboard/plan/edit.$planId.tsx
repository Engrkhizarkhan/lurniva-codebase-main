import { createFileRoute } from "@tanstack/react-router";
import { EditPlan } from "~/features/plan/components/edit-plan";

export const Route = createFileRoute("/dashboard/plan/edit/$planId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = Route.useParams();
  return <EditPlan planId={planId} />;
}
