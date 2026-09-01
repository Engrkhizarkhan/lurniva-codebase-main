import { Search } from "lucide-react";
import { Button, Input } from "@lurniva/ui";
import type { UseStudyContentSelectionResult } from "../../../hooks/useStudyContentSelection";
import { TopicTreeItem } from "./topic-tree-item";

interface SubjectPanelProps {
  content: UseStudyContentSelectionResult;
}

export function SubjectPanel({ content }: SubjectPanelProps) {
  if (!content.activeSubject) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-raised p-8 text-center text-sm text-text-muted">
        No subjects available yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text-heading">
          {content.activeSubject.label}
        </h2>
        <div className="flex gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={content.expandAll}>
            Expand all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={content.collapseAll}>
            Collapse all
          </Button>
        </div>
      </div>

      <Input
        className="mt-3"
        placeholder={`Search ${content.activeSubject.label} topics`}
        icon={<Search size={16} />}
        value={content.searchQuery}
        onChange={(event) => content.setSearchQuery(event.target.value)}
      />

      <p className="mt-3 min-h-5 text-sm font-medium text-primary">
        {content.feedbackMessage}
      </p>

      <div className="mt-2 grid max-h-[46vh] gap-2 overflow-y-auto pr-1">
        {content.topics.map((topic) => (
          <TopicTreeItem
            key={topic.topicId}
            topic={topic}
            onToggleExpanded={() => content.toggleTopicExpanded(topic.topicId)}
            onToggleTopic={() => content.toggleTopic(topic.topicId)}
            onToggleSubtopic={(subtopicId) =>
              content.toggleSubtopic(topic.topicId, subtopicId)
            }
          />
        ))}
        {content.topics.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-faint">
            No topics match your search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
