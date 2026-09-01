import { createFileRoute } from "@tanstack/react-router";
import { AiStudyPage } from "~/features/ai-study/components/ai-study-page";

export const Route = createFileRoute("/dashboard/ai-study")({
  component: AiStudyRoute,
});

function AiStudyRoute() {
  return (
    <div className="h-full">
      <AiStudyPage />
    </div>
  );
}
