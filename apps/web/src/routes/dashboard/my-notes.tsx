import { createFileRoute } from "@tanstack/react-router";
import { MyNotesPage } from "~/features/notes/components/my-notes-page";

export const Route = createFileRoute("/dashboard/my-notes")({
  component: MyNotesPage,
});
