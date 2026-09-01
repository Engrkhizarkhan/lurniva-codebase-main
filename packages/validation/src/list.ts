import { z } from "zod";

/**
 * Query params every paged list endpoint accepts. Values arrive as strings on
 * a URL, so they're coerced here rather than at each call site. `limit` is
 * capped so a client can't ask for the whole table in one request.
 */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Free-text search, normalised so `?q=` and a missing `q` behave the same. */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Parses a `URLSearchParams` with a schema, treating absent keys as absent. */
export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  params: URLSearchParams,
): z.ZodSafeParseResult<z.infer<T>> {
  return schema.safeParse(Object.fromEntries(params.entries()));
}
