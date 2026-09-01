import type { ApiErrorBody, ApiResult } from "@lurniva/types";

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ success: true, data } satisfies ApiResult<T>, init);
}

export function fail(error: ApiErrorBody, init?: ResponseInit): Response {
  return Response.json(
    { success: false, error } satisfies ApiResult<never>,
    { status: 400, ...init },
  );
}
