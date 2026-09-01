import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import { useDayStudyStore } from "../store/day-study-store";
import type { AiComposerMode, AiResponse, AiResponseStyle } from "../types";

/**
 * The single seam between the AI interaction UI and the RAG system. Components
 * call `sendMessage` and read the result off the store — none of them know how
 * the answer is produced.
 *
 * The backend is the day's grounded `respond` endpoint: conversation history +
 * topic context (and distilled source chapters when content is attached) are
 * applied server-side, so the reply comes from the real model/provider seam.
 */

async function requestAiResponse(
  planId: string,
  dayNumber: number,
  message: string,
  mode: AiComposerMode,
  responseStyle: AiResponseStyle | null,
): Promise<AiResponse> {
  const result = await authFetch<{ response: AiResponse }>(
    `/api/ai/respond/${planId}/${dayNumber}`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        mode,
        ...(responseStyle ? { responseStyle } : {}),
      }),
    },
  );
  if (!result.success) {
    throw new Error(result.error.message, { cause: result.error });
  }
  return result.data.response;
}

export function useAiResponse(planId: string, dayNumber: number) {
  const composerMode = useDayStudyStore((state) => state.composerMode);
  const responseStyle = useDayStudyStore((state) => state.responseStyle);
  const appendUserMessage = useDayStudyStore((state) => state.appendUserMessage);
  const startAiThinking = useDayStudyStore((state) => state.startAiThinking);
  const settleAiResponse = useDayStudyStore((state) => state.settleAiResponse);
  const failAiResponse = useDayStudyStore((state) => state.failAiResponse);

  const mutation = useMutation<AiResponse, Error, string>({
    mutationFn: async (message: string) => {
      appendUserMessage(message);
      startAiThinking();
      try {
        const response = await requestAiResponse(
          planId,
          dayNumber,
          message,
          composerMode,
          responseStyle,
        );
        settleAiResponse(response);
        return response;
      } catch (error) {
        failAiResponse();
        throw error;
      }
    },
  });

  const { mutateAsync } = mutation;

  const sendMessage = useCallback(
    (message: string): Promise<AiResponse> => mutateAsync(message.trim()),
    [mutateAsync],
  );

  return {
    sendMessage,
    isSending: mutation.isPending,
    error: mutation.error,
  };
}
