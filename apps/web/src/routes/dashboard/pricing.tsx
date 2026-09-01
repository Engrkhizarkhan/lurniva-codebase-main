import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "~/shared/components/ComingSoonPage";

export const Route = createFileRoute("/dashboard/pricing")({
  component: () => <ComingSoonPage title="Pricing" />,
});
