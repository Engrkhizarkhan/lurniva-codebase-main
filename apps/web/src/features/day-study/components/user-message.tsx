import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import type { AiUserMessage } from "../types";

interface UserMessageProps {
  message: AiUserMessage;
  /** Sidebar sizing: smaller bubble, no meta row. */
  compact?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** One turn the student typed: the bubble, a copy action, and the sent time. */
const UserMessage = ({ message, compact = false }: UserMessageProps) => {
  const [hovered, setHovered] = useState(false);
  const { copy, copied } = useCopyToClipboard();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
      }}
    >
      <div
        style={{
          // The student's own color, against the AI's white card, so the two
          // speakers read as distinct voices in the feed.
          background: "var(--role-student)",
          color: "var(--color-cream-100)",
          padding: compact ? "10px 14px" : "14px 18px",
          borderRadius: compact ? "var(--radius-md)" : "var(--radius-lg)",
          maxWidth: compact ? "90%" : "70%",
          fontSize: compact ? 13 : 15,
          lineHeight: 1.5,
          fontFamily: "var(--font-body)",
        }}
      >
        {message.content}
      </div>

      {compact ? null : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            aria-label={copied ? "Copied" : "Copy message"}
            onClick={() => void copy(message.content)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: copied ? "var(--success)" : "var(--text-faint)",
              opacity: hovered || copied ? 1 : 0,
              transition: "opacity var(--dur-hover) var(--ease-standard)",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            {formatTime(message.createdAt)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserMessage;
