import { useState } from "react";
import { getToneColor, getToneWellStyle } from "../constants/ai-tones";
import type { AiExplorePill, AiSuggestion } from "../types";

interface AiSuggestionsProps {
  suggestions: AiSuggestion[];
  explorePills: AiExplorePill[];
  /** Both cards and pills hand back the prompt they stand for. */
  onSelect: (prompt: string) => void;
}

interface SuggestionCardProps {
  suggestion: AiSuggestion;
  onSelect: (prompt: string) => void;
}

const SuggestionCard = ({ suggestion, onSelect }: SuggestionCardProps) => {
  const [hovered, setHovered] = useState(false);
  const Icon = suggestion.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(suggestion.prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        textAlign: "left",
        padding: 16,
        border: `1px solid ${hovered ? "var(--border-default)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        background: "white",
        cursor: "pointer",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-xs)",
        fontFamily: "var(--font-body)",
        transition:
          "box-shadow var(--dur-hover) var(--ease-standard), border-color var(--dur-hover) var(--ease-standard)",
      }}
    >
      <span style={getToneWellStyle(suggestion.tone)}>
        <Icon size={18} color={getToneColor(suggestion.tone)} />
      </span>
      <span
        style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 600, color: "var(--text-heading)" }}
        >
          {suggestion.title}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {suggestion.description}
        </span>
      </span>
    </button>
  );
};

interface ExplorePillButtonProps {
  pill: AiExplorePill;
  onSelect: (prompt: string) => void;
}

const ExplorePillButton = ({ pill, onSelect }: ExplorePillButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const Icon = pill.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(pill.prompt)}
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
        background: hovered ? "var(--surface-sunken)" : "var(--surface-raised)",
        color: "var(--text-body)",
        border: "1px solid var(--border-subtle)",
        cursor: "pointer",
        transition: "background var(--dur-hover) var(--ease-standard)",
      }}
    >
      <Icon size={16} />
      {pill.label}
    </button>
  );
};

/** The suggestion grid plus the "Explore more" pills under the greeting. */
const AiSuggestions = ({
  suggestions,
  explorePills,
  onSelect,
}: AiSuggestionsProps) => {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          width: "100%",
        }}
      >
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelect}
          />
        ))}
      </div>

      {explorePills.length > 0 ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
            }}
          >
            <span
              style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}
            />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-faint)",
                whiteSpace: "nowrap",
              }}
            >
              Explore more
            </span>
            <span
              style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {explorePills.map((pill) => (
              <ExplorePillButton key={pill.id} pill={pill} onSelect={onSelect} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
};

export default AiSuggestions;
