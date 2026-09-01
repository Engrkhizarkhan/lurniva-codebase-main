export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ success: true, data }, init);
}

export function fail(error: ApiErrorBody, init?: ResponseInit): Response {
  return Response.json(
    { success: false, error },
    { status: init?.status ?? 400, ...init },
  );
}

/** Catches known model errors and turns them into clean 400/503 responses. */
export function modelError(error: unknown): Response {
  if (error instanceof Error && /not configured/i.test(error.message)) {
    return fail(
      { message: error.message, code: "MODEL_NOT_CONFIGURED" },
      { status: 503 },
    );
  }
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  return fail({ message }, { status: 400 });
}
