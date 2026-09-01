import type { ApiResult } from "@lurniva/types";
import { supabase } from "~/utils/supabase/client";

/**
 * Authenticated multipart POST with real upload progress. `authFetch` can't do
 * this — the fetch API exposes no upload-progress events — so this is the one
 * place we drop to XMLHttpRequest. Same auth header and same `ApiResult`
 * envelope, so callers treat it exactly like `authFetch`.
 */

export interface UploadCallbacks {
  /** Bytes actually sent, 0-100. Fires many times while the body uploads. */
  onProgress?: (percent: number) => void;
  /** The whole body has reached the server; it is now doing its own work. */
  onUploaded?: () => void;
  signal?: AbortSignal;
}

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload cancelled");
  }
}

export function authUpload<T>(
  path: string,
  body: FormData,
  { onProgress, onUploaded, signal }: UploadCallbacks = {},
): Promise<ApiResult<T>> {
  return new Promise((resolve, reject) => {
    void supabase.auth.getSession().then(({ data }) => {
      if (signal?.aborted) {
        reject(new UploadAbortedError());
        return;
      }

      const request = new XMLHttpRequest();
      request.open("POST", path);
      request.setRequestHeader(
        "Authorization",
        `Bearer ${data.session?.access_token}`,
      );

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      request.upload.onload = () => {
        onProgress?.(100);
        onUploaded?.();
      };

      request.onload = () => {
        try {
          resolve(JSON.parse(request.responseText) as ApiResult<T>);
        } catch {
          reject(new Error("The server returned an unreadable response."));
        }
      };
      request.onerror = () =>
        reject(new Error("Network error — check your connection."));
      request.ontimeout = () => reject(new Error("The upload timed out."));
      request.onabort = () => reject(new UploadAbortedError());

      signal?.addEventListener("abort", () => request.abort(), { once: true });
      request.send(body);
    });
  });
}
