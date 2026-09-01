import type { ApiErrorBody, ApiResult } from "@lurniva/types";

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json(
    { success: true, data } satisfies ApiResult<T>,
    init,
  );
}

export function fail(error: ApiErrorBody, init?: ResponseInit): Response {
  return Response.json(
    { success: false, error } satisfies ApiResult<never>,
    { status: 400, ...init },
  );
}

export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2025"
  );
}
