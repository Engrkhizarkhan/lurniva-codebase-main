import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "~/shared/components/ComingSoonPage";

export const Route = createFileRoute("/dashboard/settings")({
  component: () => <ComingSoonPage title="Settings" />,
});
