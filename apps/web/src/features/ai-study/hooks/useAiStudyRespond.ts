import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetchEventStream } from "../../day-study/lib/stream-fetch";
import type { AiResponse } from "../../day-study/types";
import type { AiStudyStreamEvent } from "../services/ai-study-respond";
import { useAiStudyStore } from "../store/ai-study-store";

/**
 * The single seam between the AI Study UI and the model. Components call
 * `sendMessage` and read the turn off the store, exactly as the day-study page
 * does through `useAiResponse` — the topic context and response style are
 * applied server-side from the session, so nothing here knows how the answer
 * is produced.
 *
 * The endpoint streams: text deltas render as they arrive, and the closing
 * frame carries the full response (key points, follow-ups) that gets appended
 * to the conversation.
 */
export function useAiStudyRespond(sessionId: string | null) {
  const queryClient = useQueryClient();
  const composerMode = useAiStudyStore((state) => state.composerMode);
  const responseStyle = useAiStudyStore((state) => state.responseStyle);
  const appendUserMessage = useAiStudyStore((state) => state.appendUserMessage);
  const startAiThinking = useAiStudyStore((state) => state.startAiThinking);
  const appendAiDelta = useAiStudyStore((state) => state.appendAiDelta);
  const settleAiResponse = useAiStudyStore((state) => state.settleAiResponse);
  const failAiResponse = useAiStudyStore((state) => state.failAiResponse);

  const mutation = useMutation<AiResponse, Error, string>({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error("Start a session before asking a question.");
      appendUserMessage(message);
      startAiThinking();
      try {
        let settled: AiResponse | null = null;
        const events = authFetchEventStream<AiStudyStreamEvent>(
          `/api/ai/sessions/${sessionId}/respond`,
          {
            method: "POST",
            body: JSON.stringify({
              message,
              mode: composerMode,
              ...(responseStyle ? { responseStyle } : {}),
            }),
          },
        );

        for await (const event of events) {
          if (event.kind === "delta") {
            appendAiDelta(event.text);
          } else {
            settled = event.response;
          }
        }
        if (!settled) throw new Error("The AI reply ended before it was complete.");

        settleAiResponse(settled);
        // The turn changed the session's title and recency, so the history
        // list is refreshed — but not the open session's transcript: the store
        // already holds this turn, in a richer form than the stored text.
        void queryClient.invalidateQueries({ queryKey: ["ai-study", "sessions"] });
        return settled;
      } catch (error) {
        failAiResponse(
          error instanceof Error ? error.message : "The AI could not reply just now.",
        );
        throw error;
      }
    },
  });

  const { mutateAsync } = mutation;

  const sendMessage = useCallback(
    (message: string) => mutateAsync(message.trim()),
    [mutateAsync],
  );

  return { sendMessage, isSending: mutation.isPending, error: mutation.error };
}
