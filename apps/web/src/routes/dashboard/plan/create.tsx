import { createFileRoute } from "@tanstack/react-router";
import { CreatePlan } from "~/features/plan/components/create-plan";

export const Route = createFileRoute("/dashboard/plan/create")({
  component: CreatePlan,
});
