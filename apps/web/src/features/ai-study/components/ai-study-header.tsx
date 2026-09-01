import type { ReactNode } from "react";
import { cn } from "@lurniva/ui";
import { ChevronRight, Loader2, SquarePen } from "lucide-react";
import ModeDropdown from "../../day-study/components/mode-dropdown";
import type { StudyContextRef, StudyContextSummary, StudyMode } from "../types";
import { TopicPicker } from "./topic-picker";

interface AiStudyHeaderProps {
  context: StudyContextSummary | null;
  studyMode: StudyMode;
  /** True while a topic change is being saved to the session. */
  isUpdating?: boolean;
  disabled?: boolean;
  /** The session-history dropdown — the page owns the sessions query. */
  historyMenu: ReactNode;
  isCreatingSession: boolean;
  /** False while the open session has no conversation yet. */
  canStartNewSession: boolean;
  onTopicChange: (ref: StudyContextRef) => void;
  onStudyModeChange: (mode: StudyMode) => void;
  onNewSession: () => void;
}

/**
 * The workspace's one bar. It answers "what is the AI working with?" — the full
 * topic trail — rather than restating the page's own name, and carries the
 * controls that change the session: the mode switch, history, and a new
 * session. Everything here writes through to the session, so none of it is
 * display-only state.
 */
export function AiStudyHeader({
  context,
  studyMode,
  isUpdating = false,
  disabled = false,
  historyMenu,
  isCreatingSession,
  canStartNewSession,
  onTopicChange,
  onStudyModeChange,
  onNewSession,
}: AiStudyHeaderProps) {
  const path = context?.path ?? [];
  const triggerLabel = context?.label ?? "Choose a topic";

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border-subtle bg-surface-canvas px-4 py-3 md:px-6">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
          Studying
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TopicPicker
            label={triggerLabel}
            disabled={disabled}
            onSelect={onTopicChange}
          />
          {isUpdating ? (
            <Loader2 size={14} className="animate-spin text-text-faint" aria-hidden />
          ) : null}
          {path.length > 1 ? (
            <nav
              aria-label="Selected topic"
              className="hidden min-w-0 items-center gap-1 text-xs text-text-muted lg:flex"
            >
              {path.map((segment, index) => (
                <span key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight size={12} className="shrink-0 text-text-faint" />
                  ) : null}
                  <span
                    className={
                      index === path.length - 1
                        ? "truncate font-semibold text-text-heading"
                        : "truncate"
                    }
                  >
                    {segment}
                  </span>
                </span>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeDropdown value={studyMode} onChange={onStudyModeChange} />
        {historyMenu}
        <button
          type="button"
          onClick={onNewSession}
          disabled={isCreatingSession || !canStartNewSession}
          aria-label="New session"
          title={
            canStartNewSession
              ? "New session"
              : "Ask something in this session before starting another"
          }
          className={cn(
            "flex size-9 items-center justify-center rounded-control bg-primary text-text-on-primary",
            "transition-colors duration-150 hover:bg-primary-hover",
            "disabled:cursor-not-allowed disabled:opacity-45",
          )}
        >
          {isCreatingSession ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SquarePen size={16} />
          )}
        </button>
      </div>
    </header>
  );
}
