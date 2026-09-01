import { createFileRoute } from "@tanstack/react-router";
import { PlanDashboard } from "~/features/plan/components/plan-dashboard";

export const Route = createFileRoute("/dashboard/plan/")({
  component: PlanDashboard,
});
