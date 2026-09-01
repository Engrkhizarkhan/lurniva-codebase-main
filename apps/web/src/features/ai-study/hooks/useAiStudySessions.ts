import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { AiStudySessionDetail, AiStudySessionSummary } from "../types";
import type {
  CreateAiStudySessionInput,
  UpdateAiStudySessionInput,
} from "../validation/ai-study";

/**
 * The AI Study conversation list and its mutations. Sessions are persisted, so
 * "New session" is a real create rather than a cleared client store — the
 * previous conversation stays in history untouched.
 */

const SESSIONS_KEY = ["ai-study", "sessions"] as const;

export function aiStudySessionKey(sessionId: string) {
  return ["ai-study", "session", sessionId] as const;
}

export function useAiStudySessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: async () => {
      const result = await authFetch<{ sessions: AiStudySessionSummary[] }>(
        "/api/ai/sessions",
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data.sessions;
    },
  });
}

export function useAiStudySession(sessionId: string | null) {
  return useQuery({
    queryKey: aiStudySessionKey(sessionId ?? "none"),
    enabled: sessionId !== null,
    queryFn: async () => {
      const result = await authFetch<{ session: AiStudySessionDetail }>(
        `/api/ai/sessions/${sessionId}`,
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data.session;
    },
  });
}

export function useCreateAiStudySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAiStudySessionInput) => {
      const result = await authFetch<{ session: AiStudySessionSummary }>(
        "/api/ai/sessions",
        { method: "POST", body: JSON.stringify(input) },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data.session;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}

export function useUpdateAiStudySession(sessionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAiStudySessionInput) => {
      if (!sessionId) throw new Error("No session is open");
      const result = await authFetch<{ session: AiStudySessionSummary }>(
        `/api/ai/sessions/${sessionId}`,
        { method: "PATCH", body: JSON.stringify(input) },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data.session;
    },
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: aiStudySessionKey(session.id) });
    },
  });
}

export function useDeleteAiStudySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await authFetch<{ deleted: boolean }>(
        `/api/ai/sessions/${sessionId}`,
        { method: "DELETE" },
      );
      if (!result.success) throw new Error(result.error.message);
      return sessionId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
  });
}
