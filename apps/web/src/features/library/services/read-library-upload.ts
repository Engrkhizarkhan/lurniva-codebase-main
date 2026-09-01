import { extractText } from "~/server/ai/extract-text";

/**
 * Normalises the two ways content reaches `POST /api/library` — a multipart
 * upload or a JSON body of pasted text — into one shape. File bytes are turned
 * into text here (PDF/Word/plain), so the route handler never touches parsing.
 *
 * Returns `null` when the request body is unreadable. Throws
 * `UnsupportedFileError` for a file type we can't extract.
 */

export interface LibraryUploadInput {
  title?: string;
  description?: string;
  text: string;
  sourceType: string;
  fileName?: string;
}

function optional(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function readMultipart(
  request: Request,
): Promise<LibraryUploadInput | null> {
  const form = await request.formData().catch(() => null);
  if (!form) return null;

  const file = form.get("file");
  const pasted = (form.get("text") as string | null) ?? "";

  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractText(file.name, buffer, file.type);
    return {
      title: optional(form.get("title")),
      description: optional(form.get("description")),
      text: extracted || pasted,
      sourceType: file.name.split(".").pop()?.toLowerCase() ?? "file",
      fileName: file.name,
    };
  }

  return {
    title: optional(form.get("title")),
    description: optional(form.get("description")),
    text: pasted,
    sourceType: "text",
  };
}

async function readJson(request: Request): Promise<LibraryUploadInput | null> {
  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
    description?: unknown;
    text?: unknown;
  } | null;
  if (!body) return null;
  return {
    title: typeof body.title === "string" ? body.title : undefined,
    description:
      typeof body.description === "string" ? body.description : undefined,
    text: typeof body.text === "string" ? body.text : "",
    sourceType: "text",
  };
}

export async function readLibraryUpload(
  request: Request,
): Promise<LibraryUploadInput | null> {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("multipart/form-data")
    ? readMultipart(request)
    : readJson(request);
}
