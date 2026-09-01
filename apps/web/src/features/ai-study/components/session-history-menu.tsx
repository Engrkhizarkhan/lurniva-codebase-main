import { useState } from "react";
import { Popover } from "@mantine/core";
import { cn } from "@lurniva/ui";
import { GraduationCap, History, MessageSquare, Trash2 } from "lucide-react";
import { AI_FEATURE_BY_ID } from "../../day-study/constants/features";
import type { AiStudySessionSummary } from "../types";

interface SessionHistoryMenuProps {
  sessions: AiStudySessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

/** "3 min ago" / "Tue" / "12 Mar" — recency at a glance, not a full timestamp. */
function formatActivity(iso: string): string {
  const then = new Date(iso);
  const minutes = Math.floor((Date.now() - then.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return then.toLocaleDateString([], { weekday: "short" });
  return then.toLocaleDateString([], { day: "numeric", month: "short" });
}

/**
 * Previous conversations, as a dropdown off the header rather than a column —
 * the workspace keeps its full width and history is one click away.
 *
 * Every row is fixed-width: titles and topics truncate rather than widening
 * the menu, so the list only ever scrolls vertically.
 */
export function SessionHistoryMenu({
  sessions,
  activeSessionId,
  isLoading,
  isError,
  onRetry,
  onSelect,
  onDelete,
}: SessionHistoryMenuProps) {
  const [opened, setOpened] = useState(false);

  function choose(sessionId: string) {
    onSelect(sessionId);
    setOpened(false);
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={8}
      shadow="none"
      radius="lg"
      transitionProps={{ transition: "pop-top-right", duration: 150 }}
    >
      <Popover.Target>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={opened}
          aria-label="Session history"
          title="Session history"
          onClick={() => setOpened((current) => !current)}
          className={cn(
            "flex size-9 items-center justify-center rounded-control border border-border-default bg-white text-text-body",
            "transition-colors duration-150 hover:bg-surface-sunken",
            opened && "bg-surface-sunken",
          )}
        >
          <History size={16} />
        </button>
      </Popover.Target>

      <Popover.Dropdown className="w-[min(22rem,calc(100vw-2rem))] rounded-card! border! border-border-subtle! bg-white! p-2! shadow-modal!">
        <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
          Session history
        </p>

        {isLoading ? (
          <div className="grid gap-1.5 p-1">
            {[0, 1, 2, 3].map((row) => (
              <span key={row} className="h-14 animate-pulse rounded-xl bg-surface-sunken" />
            ))}
          </div>
        ) : isError ? (
          <div className="grid gap-2 px-3 py-8 text-center">
            <p className="text-sm text-text-muted">Could not load your conversations.</p>
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-semibold text-text-link hover:text-text-link-hover"
            >
              Try again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="grid justify-items-center gap-1.5 px-4 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-role-ai-soft text-role-ai-ink">
              <MessageSquare size={18} />
            </span>
            <p className="text-sm font-semibold text-text-heading">No sessions yet</p>
            <p className="text-xs text-text-muted">
              Start one to ask your AI tutor about any topic.
            </p>
          </div>
        ) : (
          <ul role="menu" className="grid max-h-80 gap-0.5 overflow-y-auto overflow-x-hidden">
            {sessions.map((session) => {
              const active = session.id === activeSessionId;
              const feature = session.assessmentFeature
                ? AI_FEATURE_BY_ID[session.assessmentFeature]
                : null;
              return (
                <li key={session.id} className="group relative min-w-0">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => choose(session.id)}
                    className={cn(
                      "block w-full min-w-0 rounded-xl border px-3 py-2.5 pr-9 text-left transition-colors duration-150",
                      active
                        ? "border-border-default bg-surface-subtle"
                        : "border-transparent hover:bg-surface-sunken",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      {session.studyMode === "assessment" ? (
                        <GraduationCap size={13} className="shrink-0 text-secondary" />
                      ) : (
                        <MessageSquare size={13} className="shrink-0 text-text-faint" />
                      )}
                      <span className="truncate text-sm font-semibold text-text-heading">
                        {session.title}
                      </span>
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
                      <span className="truncate">{session.context.label}</span>
                      <span aria-hidden className="text-text-faint">
                        ·
                      </span>
                      <span className="shrink-0 text-text-faint">
                        {formatActivity(session.lastActivityAt)}
                      </span>
                    </span>
                    {feature ? (
                      <span className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-secondary-soft px-1.5 py-0.5 text-[11px] font-semibold text-secondary">
                        {feature.label}
                      </span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(session.id)}
                    aria-label={`Delete ${session.title}`}
                    className="absolute right-1.5 top-2.5 flex size-7 items-center justify-center rounded-md text-text-faint opacity-0 transition-opacity duration-150 hover:bg-error-soft hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
