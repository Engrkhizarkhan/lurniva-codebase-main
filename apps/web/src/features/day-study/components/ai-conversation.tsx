import { useEffect, useRef } from "react";
import AiResponseView from "./ai-response";
import AiThinking from "./ai-thinking";
import UserMessage from "./user-message";
import type { AiConversationEntry, AiFollowUp, AiResponse } from "../types";

interface AiConversationProps {
  entries: AiConversationEntry[];
  isThinking: boolean;
  /**
   * The answer currently being written, if any. It replaces the thinking card
   * the moment the first token lands, and is replaced in turn by the settled
   * entry appended to `entries`.
   */
  streamingMessage?: string | null;
  onFollowUp: (followUp: AiFollowUp) => void;
  onSaveToNotes?: (response: AiResponse) => void;
  onPractice?: (response: AiResponse) => void;
  /** Sidebar rendering: tighter bubbles, no action row or follow-ups. */
  compact?: boolean;
}

/** A partial answer wearing the shape the settled response will have. */
function streamingResponse(message: string): AiResponse {
  return {
    id: "streaming",
    message,
    keyPoints: [],
    sourceLabel: null,
    createdAt: new Date().toISOString(),
    isLong: false,
    followUps: [],
  };
}

const AiConversation = ({
  entries,
  isThinking,
  streamingMessage = null,
  onFollowUp,
  onSaveToNotes,
  onPractice,
  compact = false,
}: AiConversationProps) => {
  const endRef = useRef<HTMLDivElement>(null);
  const isStreaming = streamingMessage !== null;

  // Tokens arrive many times a second, so following them with a smooth scroll
  // would queue animations faster than they finish; only turn boundaries glide.
  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [entries.length, isThinking, streamingMessage, isStreaming]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 16 : 24,
      }}
    >
      {entries.map((entry) =>
        entry.kind === "user" ? (
          <UserMessage
            key={entry.message.id}
            message={entry.message}
            compact={compact}
          />
        ) : (
          <AiResponseView
            key={entry.response.id}
            response={entry.response}
            onFollowUp={onFollowUp}
            onSaveToNotes={onSaveToNotes}
            onPractice={onPractice}
            compact={compact}
          />
        ),
      )}

      {isStreaming ? (
        <AiResponseView
          response={streamingResponse(streamingMessage)}
          onFollowUp={onFollowUp}
          compact={compact}
          isStreaming
        />
      ) : isThinking ? (
        <AiThinking compact={compact} />
      ) : null}

      <div ref={endRef} />
    </div>
  );
};

export default AiConversation;
