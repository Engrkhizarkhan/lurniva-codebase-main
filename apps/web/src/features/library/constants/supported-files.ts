/**
 * The file types the server can actually turn into text — mirrors
 * `SUPPORTED_FILE_EXTENSIONS` in `~/server/ai/extract-text.ts`. Nothing is
 * offered here that the extractor would reject on upload.
 */
export const SUPPORTED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".html",
] as const;

/** Value for an `<input type="file">` accept attribute. */
export const UPLOAD_ACCEPT = SUPPORTED_UPLOAD_EXTENSIONS.join(",");

/** Human-readable list for the drop zone's hint line. */
export const UPLOAD_ACCEPT_LABEL = "PDF, Word (.docx), Markdown or text";
