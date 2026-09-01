import { createFileRoute } from "@tanstack/react-router";
import { deleteStudyNote } from "~/features/notes/services/notes";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/notes/$noteId")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        const deleted = await deleteStudyNote(user.id, params.noteId);
        if (!deleted) {
          return fail({ message: "Note not found", code: "NOT_FOUND" }, { status: 404 });
        }
        return ok({ deleted });
      },
    },
  },
});
