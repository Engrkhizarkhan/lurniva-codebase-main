---
name: api-design
description: "Use when creating, editing, or reviewing any file under src/routes/api/** in apps/web — TanStack Start API route handlers. Triggers: adding a new API endpoint, changing a request/response shape, adding validation to a route, deciding where business logic for an endpoint should live, auth checks on API routes, error codes/status codes, or any file matching src/routes/api/**/*.ts. Also load when a routes/api handler is growing beyond simple orchestration (multiple concerns, inline business logic, inline auth logic) and needs to be split up."
---

# API design for `src/routes/api/**`

This app is TanStack Start with file-based API routes. These conventions are
derived from the existing routes (`api/auth/register.ts`, `api/auth/resend.ts`,
`api/users/me.ts`) — follow them exactly rather than inventing new patterns.

## Route handler = orchestration only (SRP)

A file under `routes/api/**` should do exactly four things, in order, and
nothing else:

1. Parse + validate the request body/params.
2. Run auth/authorization checks.
3. Call domain functions to do the actual work.
4. Map the result to `ok(...)`/`fail(...)`.

If a handler is doing DB queries inline, computing business rules inline, or
building emails/redirects inline, that logic has leaked into the wrong layer.
Move it out:

- **Domain/business logic** (rules, side effects like sending email, DB
  reads/writes that aren't a single trivial query) → a function in `src/lib/`
  (e.g. `checkVerificationCooldown`, `sendVerificationEmail` in
  `src/lib/verification.ts`) or `src/server/` for logic shared with page
  routes (e.g. `ensureUserProfile` in `src/server/user-profile.ts`).
- **Auth extraction** → `src/lib/supabase-admin.ts`'s `getUserFromAuthHeader`,
  not inline header parsing.
- **Response shaping** → always through `src/lib/response.ts`'s `ok`/`fail`,
  never `Response.json(...)` directly.

A handler body should read like a short script of already-named steps —
if you can't summarize it in 4-6 lines without an `if` nested more than one
level, split it further.

## Validation

- Request-body schemas live in `@lurniva/validation` (`packages/validation/src`),
  not inline in the route file — they're shared with the client-side forms
  that submit to these routes. Add new schemas there (zod, with human-readable
  `.email("Enter a valid email address")`-style messages), export both the
  schema and its inferred `z.infer` type.
- Always `request.json().catch(() => null)` before `.safeParse` — never
  `await request.json()` unguarded, and never trust the body's shape without
  going through a schema.
- Invalid body → `fail({ message, code: "VALIDATION_ERROR" }, { status: 422 })`.

## Response shape

Every API route returns the shared `ApiResult<T>` envelope
(`packages/types/src/api.ts`):

```ts
{ success: true, data: T } | { success: false, error: { message, code, details? } }
```
