import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ArrowUp, Mic, Plus } from "lucide-react";
import type { AiComposerMode } from "../types";

const MODE_OPTIONS: { value: AiComposerMode; label: string }[] = [
  { value: "guided", label: "Guided" },
  { value: "exploratory", label: "Exploratory" },
  { value: "concise", label: "Concise" },
];

interface ChatComposerProps {
  value: string;
  mode: AiComposerMode;
  placeholder?: string;
  disabled?: boolean;
  /** Sidebar sizing: tighter padding, smaller type, shorter max height. */
  compact?: boolean;
  /** Drops the attachment/mode/voice controls, leaving input + send. */
  hideExtras?: boolean;
  /**
   * Increment once a reply has fully arrived to return the caret to the input
   * so the student can keep typing. Keyed off the number rather than a render
   * or a `disabled` transition, so an unrelated re-render never steals focus
   * and a still-generating turn never pulls the caret out of another field.
   */
  focusSignal?: number;
  /** Rendered between the input and the control row — e.g. context chips. */
  toolbar?: ReactNode;
  /**
   * Extra controls for the left of the action row — e.g. the response-style
   * picker. They live inside the input so the settings that shape the next
   * answer sit where the question is written.
   */
  controls?: ReactNode;
  onChange: (value: string) => void;
  onModeChange: (mode: AiComposerMode) => void;
  onSubmit: (value: string) => void;
}

const iconButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-strong)",
  background: "transparent",
  color: "var(--primary)",
  cursor: "pointer",
  transition: "background var(--dur-hover) var(--ease-standard)",
};

/**
 * The one composer in the module. It is purely controlled — it neither talks to
 * the RAG layer nor knows whether it is mounted in the chat area or the
 * sidebar; the caller supplies state and a submit action.
 */
const ChatComposer = ({
  value,
  mode,
  placeholder = "Ask your AI tutor anything…",
  disabled = false,
  compact = false,
  hideExtras = false,
  focusSignal = 0,
  toolbar,
  controls,
  onChange,
  onModeChange,
  onSubmit,
}: ChatComposerProps) => {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showExtras = !hideExtras;
  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, compact ? 90 : 160)}px`;
  }, [value, compact]);

  useEffect(() => {
    if (focusSignal === 0 || disabled) return;
    textareaRef.current?.focus();
  }, [focusSignal, disabled]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function handleModeChange(event: ChangeEvent<HTMLSelectElement>) {
    onModeChange(event.target.value as AiComposerMode);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 12,
        background: "white",
        border: `1px solid ${focused ? "var(--border-focus)" : "var(--border-default)"}`,
        borderRadius: compact ? "var(--radius-lg)" : "var(--radius-xl)",
        boxShadow: focused ? "var(--ring-focus)" : "var(--shadow-sm)",
        padding: compact ? "10px 12px" : "18px 20px",
        boxSizing: "border-box",
        fontFamily: "var(--font-body)",
        opacity: disabled ? 0.85 : 1,
        transition:
          "border-color var(--dur-hover) var(--ease-standard), box-shadow var(--dur-hover) var(--ease-standard)",
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          resize: "none",
          border: 0,
          outline: "none",
          background: "transparent",
          fontFamily: "var(--font-body)",
          fontSize: compact ? 14 : 16,
          color: "var(--text-body)",
          lineHeight: 1.5,
          minHeight: compact ? 20 : 26,
          boxSizing: "border-box",
        }}
      />

      {toolbar}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {showExtras ? (
            <>
              <button
                type="button"
                aria-label="Add attachment"
                style={iconButtonStyle}
              >
                <Plus size={16} />
              </button>
              <select
                value={mode}
                onChange={handleModeChange}
                aria-label="Response mode"
                style={{
                  width: 118,
                  height: 36,
                  padding: "0 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background: "white",
                  color: "var(--text-body)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          {controls}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showExtras ? (
            <button
              type="button"
              aria-label="Voice input"
              style={iconButtonStyle}
            >
              <Mic size={16} />
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Send message"
            disabled={!canSend}
            onClick={submit}
            style={{
              width: compact ? 34 : 40,
              height: compact ? 34 : 40,
              borderRadius: "var(--radius-pill)",
              border: 0,
              cursor: canSend ? "pointer" : "not-allowed",
              background: canSend
                ? "var(--secondary)"
                : "var(--color-sand-300)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              transition: "background var(--dur-hover) var(--ease-standard)",
            }}
          >
            <ArrowUp
              size={compact ? 16 : 18}
              color={canSend ? "var(--color-lime-500)" : "var(--text-faint)"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComposer;
