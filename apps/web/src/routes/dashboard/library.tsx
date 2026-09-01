import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "~/features/library/components/library-page";

export const Route = createFileRoute("/dashboard/library")({
  component: LibraryPage,
});