import { createFileRoute } from "@tanstack/react-router";
import DayStudyPage from "features/day-study/components/day-study-page";

export const Route = createFileRoute("/dashboard/plan/$planId/day/$dayNumber")({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId, dayNumber } = Route.useParams();
  return <DayStudyPage planId={planId} dayNumber={Number(dayNumber)} />;
}