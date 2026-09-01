import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireOnboarded } from "~/shared/lib/route-guards";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    await requireOnboarded();
    throw redirect({ to: "/dashboard" });
  },
});
