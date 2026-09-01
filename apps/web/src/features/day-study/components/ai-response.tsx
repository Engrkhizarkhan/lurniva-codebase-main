import { useState } from "react";
import type { ReactNode } from "react";
import { Bookmark, Check, Copy, Sparkles, Target } from "lucide-react";
import AiMarkdown from "./ai-markdown";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import type { AiFollowUp, AiResponse } from "../types";

interface AiResponseProps {
  response: AiResponse;
  /** Follow-ups come off the response schema — never hardcoded here. */
  onFollowUp: (followUp: AiFollowUp) => void;
  onSaveToNotes?: (response: AiResponse) => void;
  onPractice?: (response: AiResponse) => void;
  /** Sidebar sizing: answer + key points only, no action row or follow-ups. */
  compact?: boolean;
  /**
   * The answer is still being written. Everything that only makes sense on a
   * finished turn — the action row, the follow-ups, the timestamp — is held
   * back until it settles, so nothing appears then shifts under the cursor.
   */
  isStreaming?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

type CardButtonVariant = "accent" | "outline" | "ghost";

interface CardButtonProps {
  variant: CardButtonVariant;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}

/** The design's sm Button, sized for the answer card's action row. */
const CardButton = ({
  variant,
  icon,
  children,
  onClick,
  ariaLabel,
}: CardButtonProps) => {
  const [hovered, setHovered] = useState(false);

  const palette: Record<
    CardButtonVariant,
    { background: string; color: string; border: string; hover: string }
  > = {
    accent: {
      background: "var(--accent)",
      color: "var(--text-on-accent)",
      border: "transparent",
      hover: "var(--accent-hover)",
    },
    outline: {
      background: "transparent",
      color: "var(--text-body)",
      border: "var(--border-default)",
      hover: "var(--surface-sunken)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "transparent",
      hover: "var(--surface-sunken)",
    },
  };
  const tone = palette[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        minHeight: 36,
        padding: "8px 14px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${tone.border}`,
        background: hovered ? tone.hover : tone.background,
        color: tone.color,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background var(--dur-hover) var(--ease-standard)",
      }}
    >
      {icon}
      {children}
    </button>
  );
};

interface FollowUpTagProps {
  followUp: AiFollowUp;
  onSelect: (followUp: AiFollowUp) => void;
}

const FollowUpTag = ({ followUp, onSelect }: FollowUpTagProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(followUp)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        padding: "6px 12px",
        borderRadius: "var(--radius-sm)",
        background: hovered ? "var(--surface-sunken)" : "white",
        color: "var(--text-body)",
        border: "1px solid var(--border-subtle)",
        cursor: "pointer",
        transition: "background var(--dur-hover) var(--ease-standard)",
      }}
    >
      {followUp.label}
    </button>
  );
};

/**
 * The "Lurniva AI" mark. Kept as one component so the answer card and the
 * thinking card can never drift apart.
 */
export const AiCardBadge = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      width: "fit-content",
      background: "var(--accent-soft)",
      color: "var(--text-heading)",
      border: "1px solid var(--accent)",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "var(--track-caps)",
      textTransform: "uppercase",
      padding: "4px 10px",
      borderRadius: "var(--radius-pill)",
      whiteSpace: "nowrap",
    }}
  >
    <Sparkles size={16} />
    Lurniva AI
  </span>
);

/** The white answer card both a settled and a streaming turn are drawn on. */
export const aiCardStyle = (compact: boolean) =>
  ({
    background: "white",
    color: "var(--text-body)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-sm)",
    padding: compact ? 16 : 24,
    fontFamily: "var(--font-body)",
    display: "grid",
    gap: 16,
    overflow: "hidden",
  }) as const;

/** One AI turn: the answer card and the follow-up prompts it returned. */
const AiResponseView = ({
  response,
  onFollowUp,
  onSaveToNotes,
  onPractice,
  compact = false,
  isStreaming = false,
}: AiResponseProps) => {
  const { copy, copied } = useCopyToClipboard();
  const keyPoints = compact ? response.keyPoints.slice(0, 2) : response.keyPoints;
  const showActions = !compact && !isStreaming;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: compact ? "100%" : "88%",
      }}
    >
      <div style={aiCardStyle(compact)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <AiCardBadge />
          {response.sourceLabel ? (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {response.sourceLabel}
            </span>
          ) : null}
        </div>

        <div>
          <AiMarkdown content={response.message} compact={compact} />
          {isStreaming ? <StreamingCaret /> : null}
        </div>

        {keyPoints.length > 0 ? (
          <div
            style={{
              background: "var(--surface-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: 16,
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "var(--track-caps)",
                textTransform: "uppercase",
                color: "var(--text-heading)",
              }}
            >
              Key takeaways
            </div>
            {keyPoints.map((point) => (
              <div
                key={point}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: compact ? 13 : 15,
                  lineHeight: 1.5,
                  color: "var(--text-body)",
                }}
              >
                <Check
                  size={16}
                  color="var(--success)"
                  style={{ flex: "0 0 auto", marginTop: 3 }}
                />
                <span>{point}</span>
              </div>
            ))}
          </div>
        ) : null}

        {showActions ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              paddingTop: 4,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {onPractice ? (
              <CardButton
                variant="accent"
                icon={<Target size={16} />}
                onClick={() => onPractice(response)}
              >
                Practise this
              </CardButton>
            ) : null}
            {onSaveToNotes ? (
              <CardButton
                variant="outline"
                icon={<Bookmark size={16} />}
                onClick={() => onSaveToNotes(response)}
              >
                Save to notes
              </CardButton>
            ) : null}
            <CardButton
              variant="ghost"
              ariaLabel={copied ? "Copied" : "Copy response"}
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={() => void copy(response.message)}
            >
              {copied ? "Copied" : "Copy"}
            </CardButton>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--text-faint)",
              }}
            >
              {formatTime(response.createdAt)}
            </span>
          </div>
        ) : null}
      </div>

      {compact || isStreaming || response.followUps.length === 0 ? null : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {response.followUps.map((followUp) => (
            <FollowUpTag
              key={followUp.id}
              followUp={followUp}
              onSelect={onFollowUp}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** The blinking block that marks where the next token will land. */
const StreamingCaret = () => (
  <>
    <style>
      {"@keyframes lurniva-caret{0%,45%{opacity:1}55%,100%{opacity:0}}"}
    </style>
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 8,
        height: 16,
        marginLeft: 2,
        verticalAlign: "-2px",
        borderRadius: 2,
        background: "var(--accent-hover)",
        animation: "lurniva-caret 1s steps(1, end) infinite",
      }}
    />
  </>
);

export default AiResponseView;
