import { useMutation } from "@tanstack/react-query";
import { authFetchStream } from "../lib/stream-fetch";
import { useDayStudyStore } from "../store/day-study-store";

export function useAiChat(planId: string, dayNumber: number) {
  const appendUserChatMessage = useDayStudyStore((state) => state.appendUserChatMessage);
  const startChatStream = useDayStudyStore((state) => state.startChatStream);
  const appendChatStreamChunk = useDayStudyStore((state) => state.appendChatStreamChunk);
  const finishChatStream = useDayStudyStore((state) => state.finishChatStream);
  const failChatStream = useDayStudyStore((state) => state.failChatStream);

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      appendUserChatMessage(message);
      startChatStream();
      try {
        for await (const chunk of authFetchStream(`/api/ai/chat/${planId}/${dayNumber}`, {
          method: "POST",
          body: JSON.stringify({ message }),
        })) {
          appendChatStreamChunk(chunk);
        }
        finishChatStream();
      } catch (error) {
        failChatStream();
        throw error;
      }
    },
  });

  return {
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
    error: mutation.error,
  };
}
