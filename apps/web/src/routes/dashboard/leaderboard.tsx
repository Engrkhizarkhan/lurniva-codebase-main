import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "~/shared/components/ComingSoonPage";

export const Route = createFileRoute("/dashboard/leaderboard")({
  component: () => <ComingSoonPage title="Leaderboard" />,
});
