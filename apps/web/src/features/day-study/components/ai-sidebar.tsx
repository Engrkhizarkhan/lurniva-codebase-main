import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import AiConversation from "./ai-conversation";
import type { AiConversationEntry, AiFollowUp } from "../types";
import TextActionButton from "shared/components/text-action-button";

const EXPANDED_WIDTH = 380;
const COLLAPSED_WIDTH = 56;

interface AiSidebarProps {
  expanded: boolean;
  entries: AiConversationEntry[];
  isThinking: boolean;
  /** The answer currently streaming in, if any — see `AiConversation`. */
  streamingMessage?: string | null;
  /** The one chat composer, handed down so it moves rather than duplicates. */
  composer: ReactNode;
  onFollowUp: (followUp: AiFollowUp) => void;
  onToggle: (expanded: boolean) => void;
  onReturnToChat: () => void;
}

interface SidebarIconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

const SidebarIconButton = ({
  label,
  icon,
  onClick,
}: SidebarIconButtonProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30,
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        border: 0,
        borderRadius: "var(--radius-sm)",
        background: hovered ? "var(--primary-soft)" : "transparent",
        color: "var(--primary)",
        cursor: "pointer",
        transition: "background var(--dur-hover) var(--ease-standard)",
      }}
    >
      {icon}
    </button>
  );
};

/**
 * The workspace-mode chat panel. It is the same conversation as the main chat
 * area — only the composer's slot and the message density change — so nothing
 * here is a second chat system.
 */
const AiSidebar = ({
  expanded,
  entries,
  isThinking,
  streamingMessage = null,
  composer,
  onFollowUp,
  onToggle,
  onReturnToChat,
}: AiSidebarProps) => {
  return (
    <aside
      style={{
        width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        flex: "0 0 auto",
        borderLeft: "1px solid var(--border-subtle)",
        background: "white",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "var(--font-body)",
        transition: "width var(--dur-sidebar) var(--ease-standard)",
      }}
    >
      {expanded ? (
        <>
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="var(--color-lime-700)" />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--text-heading)",
                  }}
                >
                  AI Study
                </span>
              </div>
              <SidebarIconButton
                label="Collapse sidebar"
                icon={<PanelRightClose size={16} />}
                onClick={() => onToggle(false)}
              />
            </div>

            <TextActionButton onClick={onReturnToChat}>
              <ArrowLeft size={14} />
              <span>Return to chat</span>
            </TextActionButton>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <AiConversation
              entries={entries}
              isThinking={isThinking}
              streamingMessage={streamingMessage}
              onFollowUp={onFollowUp}
              compact
            />
          </div>

          <div
            style={{
              flex: "0 0 auto",
              padding: 12,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {composer}
          </div>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 13,
          }}
        >
          <SidebarIconButton
            label="Open AI Study sidebar"
            icon={<PanelRightOpen size={16} />}
            onClick={() => onToggle(true)}
          />
        </div>
      )}
    </aside>
  );
};

export default AiSidebar;
