import { createFileRoute } from "@tanstack/react-router";
import { TeachersPage } from "~/features/teachers/components/teachers-page";

export const Route = createFileRoute("/dashboard/teachers/")({
  component: TeachersPage,
});
