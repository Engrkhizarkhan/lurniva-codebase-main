import { createFileRoute } from "@tanstack/react-router";
import {
  deleteLibraryItem,
  getLibraryItem,
  LibraryItemNotFoundError,
  processLibraryItem,
} from "~/features/library/services/library-items";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/library/$libraryId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        try {
          const item = await getLibraryItem(user.id, params.libraryId);
          return ok({ item });
        } catch (error) {
          if (error instanceof LibraryItemNotFoundError)
            return fail({ message: "Library item not found", code: "NOT_FOUND" }, { status: 404 });
          throw error;
        }
      },

      /** Process a raw/failed item now — used when selecting content in plan stages. */
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        try {
          const item = await processLibraryItem(user.id, params.libraryId);
          return ok({ item });
        } catch (error) {
          if (error instanceof LibraryItemNotFoundError)
            return fail({ message: "Library item not found", code: "NOT_FOUND" }, { status: 404 });
          const message = error instanceof Error ? error.message : "Processing failed.";
          return fail({ message, code: "LIBRARY_ERROR" }, { status: 500 });
        }
      },

      DELETE: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        const deleted = await deleteLibraryItem(user.id, params.libraryId);
        if (!deleted)
          return fail({ message: "Library item not found", code: "NOT_FOUND" }, { status: 404 });
        return ok({ deleted });
      },
    },
  },
});