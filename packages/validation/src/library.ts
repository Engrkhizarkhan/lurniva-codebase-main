import { z } from "zod";
import { paginationQuerySchema, searchQuerySchema } from "./list.js";

export const libraryScopeSchema = z.enum(["lurniva", "personal"]);
export type LibraryScope = z.infer<typeof libraryScopeSchema>;

export const libraryStatusSchema = z.enum([
  "raw",
  "processing",
  "ready",
  "failed",
]);
export type LibraryStatus = z.infer<typeof libraryStatusSchema>;

/** The shortest body of text worth distilling into chapters. */
export const MIN_LIBRARY_TEXT_LENGTH = 40;
export const MAX_LIBRARY_TEXT_LENGTH = 200_000;

/** `GET /api/library` — one page of the caller's library, filtered. */
export const listLibraryQuerySchema = paginationQuerySchema
  .extend(searchQuerySchema.shape)
  .extend({
    scope: libraryScopeSchema.optional(),
    status: libraryStatusSchema.optional(),
  });
export type ListLibraryQuery = z.infer<typeof listLibraryQuerySchema>;

/** `POST /api/library` with a JSON body — pasted text rather than a file. */
export const createLibraryItemSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
  text: z
    .string()
    .trim()
    .min(MIN_LIBRARY_TEXT_LENGTH, "Provide at least a paragraph of content.")
    .max(MAX_LIBRARY_TEXT_LENGTH),
});
export type CreateLibraryItemInput = z.infer<typeof createLibraryItemSchema>;
