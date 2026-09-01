import mammoth from "mammoth";

import { ensurePdfCanvasPolyfills } from "./pdf-canvas-polyfill";

/**
 * Text extraction for content the student attaches to a study day: plain
 * text/markdown are read directly; PDFs and Word documents are parsed with
 * pdf-parse and mammoth respectively. Returns extracted UTF-8 text, never
 * rendering or executing anything in the payload.
 */

export const SUPPORTED_TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".html",
] as const;

export const SUPPORTED_FILE_EXTENSIONS = [
  ...SUPPORTED_TEXT_EXTENSIONS,
  ".pdf",
  ".docx",
] as const;

export type SupportedFileExtension = (typeof SUPPORTED_FILE_EXTENSIONS)[number];

export const CONTENT_MIME_TYPES: Record<string, string> = {
  "text/plain": ".txt",
  "text/markdown": ".md",
  "application/json": ".json",
  "text/html": ".html",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

export class UnsupportedFileError extends Error {
  constructor(extension: string) {
    super(`Unsupported file type "${extension}". Attach .txt, .md, .docx or .pdf.`);
  }
}

export function extensionOf(fileName: string, mimeType?: string | null): string {
  const dot = fileName.lastIndexOf(".");
  if (dot >= 0) return fileName.slice(dot).toLowerCase();
  if (mimeType && CONTENT_MIME_TYPES[mimeType]) return CONTENT_MIME_TYPES[mimeType]!;
  return "";
}

export async function extractText(
  fileName: string,
  buffer: Buffer,
  mimeType?: string | null,
): Promise<string> {
  const ext = extensionOf(fileName, mimeType);

  if (SUPPORTED_TEXT_EXTENSIONS.includes(ext as (typeof SUPPORTED_TEXT_EXTENSIONS)[number])) {
    return buffer.toString("utf-8");
  }

  if (ext === ".pdf") {
    ensurePdfCanvasPolyfills();
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text ?? "";
    } finally {
      await parser.destroy();
    }
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  throw new UnsupportedFileError(ext || "(unknown)");
}

/** Speculative text from plain-text buffers, for when we have neither name nor mime. */
export function isPlausibleText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, 4096);
  return !sample.subarray(0, 5).includes(0);
}