import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { StudyNote } from "../../day-study/types";

export const NOTES_QUERY_KEY = ["notes"] as const;

export function useStudyNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => {
      const result = await authFetch<{ notes: StudyNote[] }>("/api/notes");
      if (!result.success) throw new Error(result.error.message);
      return result.data.notes;
    },
  });
}

export interface CreateStudyNoteInput {
  text: string;
  categoryId: string;
  /** Where the note was taken from, e.g. "Physics · Day 3". */
  sourceLabel?: string | null;
}

/**
 * Saves a highlighted (or whole-response) note. Callers that already know the
 * current topic/day pass it as `sourceLabel` so the note carries that context
 * on the My Notes page.
 */
export function useCreateStudyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStudyNoteInput) => {
      const result = await authFetch<{ note: StudyNote }>("/api/notes", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data.note;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useDeleteStudyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await authFetch<{ deleted: boolean }>(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!result.success) throw new Error(result.error.message);
      return noteId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
