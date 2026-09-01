import type { UnscheduledChapter, UnscheduledTopic } from "../../../lib/timeline-math";
import { DraggableTopicCard } from "./draggable-topic-card";
import { DraggableChapterCard } from "./draggable-chapter-card";

interface TopicsToSchedulePanelProps {
  topics: UnscheduledTopic[];
  chapters: UnscheduledChapter[];
  libraryOnly?: boolean;
}

export function TopicsToSchedulePanel({
  topics,
  chapters,
  libraryOnly = false,
}: TopicsToSchedulePanelProps) {
  const isEmpty = topics.length === 0 && chapters.length === 0;
  const heading =
    topics.length > 0 && chapters.length > 0
      ? "To Schedule"
      : chapters.length > 0
        ? "Chapters to Schedule"
        : "Topics to Schedule";

  return (
    <div className="sticky top-6 flex flex-col rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-sm md:top-8">
      <h2 className="text-sm font-bold text-text-heading">{heading}</h2>
      <p className="mt-0.5 text-xs text-text-muted">
        Drag an item onto any day — a day can hold more than one.
      </p>

      <div className="mt-3 grid gap-2">
        {chapters.map((chapter) => (
          <DraggableChapterCard
            key={`${chapter.libraryItemId}:${chapter.chapterId}`}
            chapter={chapter}
          />
        ))}
        {topics.map((topic) => (
          <DraggableTopicCard key={topic.topicId} topic={topic} />
        ))}
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-text-faint">
            {libraryOnly
              ? "Library study only — no catalog topics to schedule."
              : "Everything is scheduled."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
