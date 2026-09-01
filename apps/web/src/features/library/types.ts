/**
 * Client-side lifecycle of one item the student is adding to the library.
 * Every stage maps to something the system actually did — there is no
 * synthetic progress here:
 *
 *  queued     waiting behind another upload (we send one at a time)
 *  uploading  bytes on the wire; `progress` is real XHR upload progress
 *  uploaded   the whole body reached the server, which is reading the document
 *  processing the row exists with status `processing`; the model is distilling it
 *  ready      the server reported status `ready`
 *  failed     the upload errored, or the server reported status `failed`
 */
export type UploadStage =
  "queued" | "uploading" | "uploaded" | "processing" | "ready" | "failed";

export interface UploadTask {
  id: string;
  /** File name, or the typed title for pasted text. */
  label: string;
  /** Bytes for a file upload; null when the source is pasted text. */
  sizeBytes: number | null;
  stage: UploadStage;
  /** 0-100, meaningful only while `stage` is "uploading". */
  progress: number;
  /** Set once the server has created the row. */
  itemId: string | null;
  error: string | null;
}

export interface AddLibraryContentInput {
  title?: string;
  description?: string;
  file?: File | null;
  text: string;
}
