import { AiCardBadge, aiCardStyle } from "./ai-response";

const SKELETON_WIDTHS = [92, 76, 58];

interface AiThinkingProps {
  /** Say what the AI is doing, not "Thinking…" — brand voice. */
  label?: string;
  /** Sidebar sizing. */
  compact?: boolean;
}

/**
 * The loading state of an AI answer: the same white card the answer will
 * occupy, with pulsing placeholder bars. Purely presentational — the store
 * decides when it is on screen.
 */
const AiThinking = ({
  label = "Reading your study plan",
  compact = false,
}: AiThinkingProps) => {
  return (
    <div style={aiCardStyle(compact)}>
      <style>
        {"@keyframes lurniva-pulse{0%,100%{opacity:.45}50%{opacity:1}}"}
      </style>

      <AiCardBadge />

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 15, color: "var(--text-muted)" }}>
          {label}…
        </span>
        {SKELETON_WIDTHS.map((width) => (
          <span
            key={width}
            style={{
              height: 12,
              width: `${width}%`,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-sunken)",
              animation: "lurniva-pulse 1.2s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AiThinking;
