import { createFileRoute } from "@tanstack/react-router";
import {
  createLibraryItemSchema,
  listLibraryQuerySchema,
  MIN_LIBRARY_TEXT_LENGTH,
  parseSearchParams,
} from "@lurniva/validation";
import {
  createLibraryItem,
  listLibraryItemsPage,
} from "~/features/library/services/library-items";
import { readLibraryUpload } from "~/features/library/services/read-library-upload";
import { UnsupportedFileError } from "~/server/ai/extract-text";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/library/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );

        const parsed = parseSearchParams(
          listLibraryQuerySchema,
          new URL(request.url).searchParams,
        );
        if (!parsed.success) {
          return fail(
            {
              message: "Invalid query parameters",
              code: "VALIDATION_ERROR",
              details: { issues: parsed.error.issues },
            },
            { status: 422 },
          );
        }

        try {
          return ok(await listLibraryItemsPage(user.id, parsed.data));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load library.";
          return fail({ message, code: "LIBRARY_ERROR" }, { status: 500 });
        }
      },

      /**
       * Accepts an upload (multipart) or pasted text (JSON) and returns the new
       * item immediately in its `processing` state — distillation continues
       * server-side and the client polls the item until it settles.
       */
      POST: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );

        let input;
        try {
          input = await readLibraryUpload(request);
        } catch (error) {
          if (error instanceof UnsupportedFileError)
            return fail(
              { message: error.message, code: "VALIDATION_ERROR" },
              { status: 422 },
            );
          throw error;
        }

        if (!input) {
          return fail(
            { message: "Invalid upload", code: "VALIDATION_ERROR" },
            { status: 422 },
          );
        }

        const parsed = createLibraryItemSchema.safeParse(input);
        if (!parsed.success) {
          return fail(
            {
              message: `Provide at least ${MIN_LIBRARY_TEXT_LENGTH} characters of content.`,
              code: "VALIDATION_ERROR",
              details: { issues: parsed.error.issues },
            },
            { status: 422 },
          );
        }

        try {
          const item = await createLibraryItem(user.id, {
            ...parsed.data,
            sourceType: input.sourceType,
            fileName: input.fileName,
          });
          return ok({ item }, { status: 201 });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add content.";
          return fail({ message, code: "LIBRARY_ERROR" }, { status: 500 });
        }
      },
    },
  },
});
