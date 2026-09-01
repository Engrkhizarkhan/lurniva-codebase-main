import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/plan/$planId")({
  component: () => <Outlet />,
});
