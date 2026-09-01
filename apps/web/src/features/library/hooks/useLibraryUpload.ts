import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import { authUpload, UploadAbortedError } from "~/shared/lib/upload-client";
import type { LibraryItemDto } from "../services/library-items";
import type { AddLibraryContentInput, UploadStage, UploadTask } from "../types";
import { LIBRARY_QUERY_KEY } from "./useLibraryItems";

/** How often we re-check an item the server is still distilling. */
const WATCH_INTERVAL_MS = 2500;
/** Stop watching after this long and let the user retry rather than spin forever. */
const WATCH_TIMEOUT_MS = 5 * 60 * 1000;

function taskId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function describeError(error: unknown): string {
  if (error instanceof UploadAbortedError) return "Upload cancelled.";
  if (error instanceof Error) return error.message;
  return "Something went wrong while adding this content.";
}

/** The server's item status maps 1:1 onto the tail of our stage list. */
function stageFromItem(item: LibraryItemDto): UploadStage {
  if (item.status === "ready") return "ready";
  if (item.status === "failed") return "failed";
  return "processing";
}

function labelFor(input: AddLibraryContentInput): string {
  return input.file?.name || input.title?.trim() || "Pasted content";
}

function toFormData(input: AddLibraryContentInput): FormData {
  const form = new FormData();
  if (input.title?.trim()) form.set("title", input.title.trim());
  if (input.description?.trim())
    form.set("description", input.description.trim());
  if (input.file) form.set("file", input.file);
  else form.set("text", input.text);
  return form;
}

/**
 * The Library's upload queue. Owns every asynchronous step of adding content —
 * sending the bytes, watching the server distil them, and retrying — so the
 * upload UI only renders tasks and calls back. Uploads run one at a time (so
 * the progress bar means something), while items already accepted keep being
 * watched in parallel.
 */
export function useLibraryUpload() {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  // Queue plumbing lives in refs: it must not re-render, and the runner has to
  // read the latest value rather than the one captured at render time.
  const sourcesRef = useRef(new Map<string, AddLibraryContentInput>());
  const pendingRef = useRef<string[]>([]);
  const isDrainingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const patchTask = useCallback((id: string, patch: Partial<UploadTask>) => {
    if (!isMountedRef.current) return;
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    );
  }, []);

  const invalidateLibrary = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
  }, [queryClient]);

  /** Polls one item until the server stops reporting `processing`. */
  const watchItem = useCallback(
    async (id: string, itemId: string) => {
      const deadline = Date.now() + WATCH_TIMEOUT_MS;
      while (isMountedRef.current && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, WATCH_INTERVAL_MS));
        if (!isMountedRef.current) return;

        const result = await authFetch<{ item: LibraryItemDto }>(
          `/api/library/${itemId}`,
        );
        if (!result.success) continue;

        const stage = stageFromItem(result.data.item);
        if (stage === "processing") continue;

        patchTask(id, {
          stage,
          error: stage === "failed" ? (result.data.item.error ?? null) : null,
        });
        invalidateLibrary();
        return;
      }

      patchTask(id, {
        stage: "failed",
        error: "This is taking longer than expected. Try processing it again.",
      });
    },
    [invalidateLibrary, patchTask],
  );

  const runTask = useCallback(
    async (id: string) => {
      const input = sourcesRef.current.get(id);
      if (!input) return;

      patchTask(id, { stage: "uploading", progress: 0, error: null });

      try {
        const result = await authUpload<{ item: LibraryItemDto }>(
          "/api/library",
          toFormData(input),
          {
            onProgress: (progress) => patchTask(id, { progress }),
            onUploaded: () =>
              patchTask(id, { stage: "uploaded", progress: 100 }),
          },
        );

        if (!result.success) {
          patchTask(id, { stage: "failed", error: result.error.message });
          return;
        }

        const { item } = result.data;
        const stage = stageFromItem(item);
        patchTask(id, {
          stage,
          itemId: item.id,
          error: stage === "failed" ? (item.error ?? null) : null,
        });
        invalidateLibrary();

        // Not awaited: the next upload can start while this one distils.
        if (stage === "processing") void watchItem(id, item.id);
      } catch (error) {
        patchTask(id, { stage: "failed", error: describeError(error) });
      }
    },
    [invalidateLibrary, patchTask, watchItem],
  );

  const drain = useCallback(async () => {
    if (isDrainingRef.current) return;
    isDrainingRef.current = true;
    try {
      let next = pendingRef.current.shift();
      while (next) {
        await runTask(next);
        next = pendingRef.current.shift();
      }
    } finally {
      isDrainingRef.current = false;
    }
  }, [runTask]);

  const enqueue = useCallback(
    (input: AddLibraryContentInput) => {
      const id = taskId();
      sourcesRef.current.set(id, input);
      pendingRef.current.push(id);
      setTasks((current) => [
        ...current,
        {
          id,
          label: labelFor(input),
          sizeBytes: input.file?.size ?? null,
          stage: "queued",
          progress: 0,
          itemId: null,
          error: null,
        },
      ]);
      void drain();
      return id;
    },
    [drain],
  );

  /** Re-runs whichever step failed: the upload itself, or the distillation. */
  const retry = useCallback(
    (id: string) => {
      const task = tasks.find((entry) => entry.id === id);
      if (!task) return;

      if (task.itemId) {
        patchTask(id, { stage: "processing", error: null });
        void authFetch<{ item: LibraryItemDto }>(
          `/api/library/${task.itemId}`,
          {
            method: "POST",
          },
        ).then((result) => {
          if (!result.success) {
            patchTask(id, { stage: "failed", error: result.error.message });
            return;
          }
          invalidateLibrary();
          void watchItem(id, task.itemId as string);
        });
        return;
      }

      patchTask(id, { stage: "queued", progress: 0, error: null });
      pendingRef.current.push(id);
      void drain();
    },
    [drain, invalidateLibrary, patchTask, tasks, watchItem],
  );

  const dismiss = useCallback((id: string) => {
    sourcesRef.current.delete(id);
    pendingRef.current = pendingRef.current.filter((entry) => entry !== id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const clearSettled = useCallback(() => {
    setTasks((current) => {
      for (const task of current) {
        if (task.stage === "ready") sourcesRef.current.delete(task.id);
      }
      return current.filter((task) => task.stage !== "ready");
    });
  }, []);

  return { tasks, enqueue, retry, dismiss, clearSettled };
}
