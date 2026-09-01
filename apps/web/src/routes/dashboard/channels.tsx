import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "~/shared/components/ComingSoonPage";

export const Route = createFileRoute("/dashboard/channels")({
  component: () => <ComingSoonPage title="Channels" />,
});
