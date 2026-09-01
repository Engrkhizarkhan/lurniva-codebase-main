import { createFileRoute } from "@tanstack/react-router";
import { createStudyNote, listStudyNotes } from "~/features/notes/services/notes";
import { createStudyNoteSchema } from "~/features/notes/validation/notes";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/notes/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        try {
          const notes = await listStudyNotes(user.id);
          return ok({ notes });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to load notes.";
          return fail({ message, code: "NOTES_ERROR" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = createStudyNoteSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            {
              message: "Invalid request body",
              code: "VALIDATION_ERROR",
              details: { issues: parsed.error.issues },
            },
            { status: 422 },
          );
        }

        try {
          const note = await createStudyNote(user.id, parsed.data);
          return ok({ note }, { status: 201 });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to save note.";
          return fail({ message, code: "NOTES_ERROR" }, { status: 500 });
        }
      },
    },
  },
});
