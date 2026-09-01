import { useMemo, useState } from "react";
import { Popover } from "@mantine/core";
import { Button, cn } from "@lurniva/ui";
import {
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  ChevronRight,
  Library,
  MessageCircle,
  Search,
} from "lucide-react";
import { useStudySources } from "../hooks/useStudySources";
import type { StudyContextRef } from "../types";

/**
 * Chooses what the AI is grounded on. The three sources map to the three real
 * places study material lives in the product — the subject catalog, the
 * library, and a study plan's days — plus an explicit "General study" escape
 * hatch, so the student is never forced to pretend they have a topic.
 *
 * The picker only ever emits ids; every label is re-resolved server-side.
 */

type SourceTab = "catalog" | "library" | "plan";

interface TopicPickerProps {
  /** Rendered inside the trigger button. */
  label: string;
  disabled?: boolean;
  onSelect: (ref: StudyContextRef) => void;
}

function matches(query: string, ...fields: string[]): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(needle));
}

const TABS: { id: SourceTab; label: string; icon: typeof BookOpen }[] = [
  { id: "catalog", label: "Subjects", icon: BookOpen },
  { id: "library", label: "Library", icon: Library },
  { id: "plan", label: "Study plans", icon: CalendarCheck2 },
];

export function TopicPicker({
  label,
  disabled = false,
  onSelect,
}: TopicPickerProps) {
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<SourceTab>("catalog");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: sources, isLoading, isError, refetch } = useStudySources();

  const subjects = useMemo(() => {
    if (!sources) return [];
    return sources.subjects
      .map((subject) => ({
        ...subject,
        topics: subject.topics.filter((topic) =>
          matches(
            query,
            topic.label,
            subject.label,
            ...topic.subtopics.map((s) => s.label),
          ),
        ),
      }))
      .filter((subject) => subject.topics.length > 0);
  }, [sources, query]);

  const libraryItems = useMemo(
    () =>
      (sources?.library ?? []).filter((item) =>
        matches(
          query,
          item.title,
          ...item.chapters.map((chapter) => chapter.title),
        ),
      ),
    [sources, query],
  );

  const plans = useMemo(
    () =>
      (sources?.plans ?? [])
        .map((plan) => ({
          ...plan,
          days: plan.days.filter((day) =>
            matches(query, plan.name, day.label, `day ${day.dayNumber}`),
          ),
        }))
        .filter((plan) => plan.days.length > 0),
    [sources, query],
  );

  function choose(ref: StudyContextRef) {
    onSelect(ref);
    setOpened(false);
    setQuery("");
  }

  function toggle(key: string) {
    setExpanded((current) => (current === key ? null : key));
  }

  const rowClass =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-body transition-colors duration-100 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-border-focus";

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      offset={8}
      shadow="none"
      radius="lg"
      transitionProps={{ transition: "pop-top-left", duration: 150 }}
    >
      <Popover.Target>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={opened}
          onClick={() => setOpened((current) => !current)}
          icon={<BookOpen size={14} />}
          iconAfter={
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                opened && "rotate-180",
              )}
            />
          }
          className="max-w-full"
        >
          <span className="max-w-56 truncate">{label}</span>
        </Button>
      </Popover.Target>

      <Popover.Dropdown className="w-[min(26rem,calc(100vw-2rem))] rounded-card! border! border-border-subtle! bg-white! p-3! shadow-modal!">
        <div className="flex w-fit items-center gap-1.5 rounded-xl bg-surface-canvas p-1.5">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              aria-pressed={tab === entry.id}
              className={cn(
                "flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-xs font-semibold tracking-[-0.01em] transition-all duration-150",
                tab === entry.id
                  ? "bg-white text-text-heading shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-text-muted hover:bg-white/60 hover:text-text-body",
              )}
            >
              <entry.icon size={14} strokeWidth={1.8} />
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border-subtle px-2.5">
          <Search size={14} className="shrink-0 text-text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics"
            aria-label="Search topics"
            className="h-9 w-full border-0 bg-transparent text-sm text-text-body outline-none placeholder:text-text-faint"
          />
        </div>

        <div className="mt-2 max-h-72 overflow-y-auto pr-0.5">
          {isLoading ? (
            <div className="grid gap-1.5 py-2">
              {[0, 1, 2, 3].map((row) => (
                <span
                  key={row}
                  className="h-9 animate-pulse rounded-lg bg-surface-sunken"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="grid gap-2 py-6 text-center">
              <p className="text-sm text-text-muted">
                Could not load study material.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-sm font-semibold text-text-link hover:text-text-link-hover"
              >
                Try again
              </button>
            </div>
          ) : tab === "catalog" ? (
            subjects.length === 0 ? (
              <EmptyRow message="No subjects match that search." />
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="mb-1">
                  <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                    {subject.label}
                  </p>
                  {subject.topics.map((topic) => {
                    const key = `topic:${topic.id}`;
                    const isOpen = expanded === key;
                    return (
                      <div key={topic.id}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className={cn(rowClass, "flex-1")}
                            onClick={() =>
                              choose({
                                kind: "catalog",
                                subjectId: subject.id,
                                topicId: topic.id,
                              })
                            }
                          >
                            <span className="truncate">{topic.label}</span>
                          </button>
                          {topic.subtopics.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              aria-expanded={isOpen}
                              aria-label={
                                isOpen
                                  ? `Hide subtopics of ${topic.label}`
                                  : `Show subtopics of ${topic.label}`
                              }
                              className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-subtle hover:text-text-body"
                            >
                              {isOpen ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          ) : null}
                        </div>
                        {isOpen
                          ? topic.subtopics.map((subtopic) => (
                              <button
                                key={subtopic.id}
                                type="button"
                                className={cn(rowClass, "pl-7 text-text-muted")}
                                onClick={() =>
                                  choose({
                                    kind: "catalog",
                                    subjectId: subject.id,
                                    topicId: topic.id,
                                    subtopicId: subtopic.id,
                                  })
                                }
                              >
                                <span className="truncate">
                                  {subtopic.label}
                                </span>
                              </button>
                            ))
                          : null}
                      </div>
                    );
                  })}
                </div>
              ))
            )
          ) : tab === "library" ? (
            libraryItems.length === 0 ? (
              <EmptyRow message="No processed library material yet." />
            ) : (
              libraryItems.map((item) => {
                const key = `lib:${item.id}`;
                const isOpen = expanded === key;
                return (
                  <div key={item.id}>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className={cn(rowClass, "flex-1")}
                        onClick={() =>
                          choose({ kind: "library", libraryItemId: item.id })
                        }
                      >
                        <Library
                          size={14}
                          className="shrink-0 text-text-faint"
                        />
                        <span className="truncate">{item.title}</span>
                      </button>
                      {item.chapters.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-expanded={isOpen}
                          aria-label={
                            isOpen
                              ? `Hide chapters of ${item.title}`
                              : `Show chapters of ${item.title}`
                          }
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-surface-subtle hover:text-text-body"
                        >
                          {isOpen ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      ) : null}
                    </div>
                    {isOpen
                      ? item.chapters.map((chapter) => (
                          <button
                            key={chapter.id}
                            type="button"
                            className={cn(rowClass, "pl-7 text-text-muted")}
                            onClick={() =>
                              choose({
                                kind: "library",
                                libraryItemId: item.id,
                                chapterId: chapter.id,
                              })
                            }
                          >
                            <span className="truncate">{chapter.title}</span>
                          </button>
                        ))
                      : null}
                  </div>
                );
              })
            )
          ) : plans.length === 0 ? (
            <EmptyRow message="No active study plan days to study." />
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="mb-1">
                <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                  {plan.name}
                </p>
                {plan.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    className={rowClass}
                    onClick={() =>
                      choose({
                        kind: "plan_day",
                        planId: plan.id,
                        dayNumber: day.dayNumber,
                      })
                    }
                  >
                    <span className="w-12 shrink-0 text-xs font-semibold text-text-faint">
                      Day {day.dayNumber}
                    </span>
                    <span className="truncate">{day.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => choose({ kind: "general" })}
          className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border-default px-2.5 py-2 text-sm text-text-muted transition-colors duration-100 hover:bg-surface-subtle hover:text-text-body"
        >
          <MessageCircle size={14} />
          General study — no specific topic
        </button>
      </Popover.Dropdown>
    </Popover>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <p className="px-2.5 py-8 text-center text-sm text-text-faint">{message}</p>
  );
}
