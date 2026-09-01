import { useMemo, useState } from "react";
import type { CatalogSubject, ContentSelectionDraft } from "../create-plan-types";

function countSelectedTopics(
  subject: CatalogSubject,
  selectedMap: ContentSelectionDraft["selectedSubtopicIdsByTopicId"],
): number {
  return subject.topics.filter((topic) => (selectedMap[topic.id]?.length ?? 0) > 0)
    .length;
}

export interface SubjectRailItem {
  subjectId: string;
  label: string;
  icon: CatalogSubject["icon"];
  selectedTopicCount: number;
  isActive: boolean;
}

export interface SubtopicSelectionItem {
  subtopicId: string;
  label: string;
  selected: boolean;
}

export type TopicSelectionState = "all" | "some" | "none";

export interface TopicSelectionItem {
  topicId: string;
  label: string;
  subtopics: SubtopicSelectionItem[];
  selectionState: TopicSelectionState;
  expanded: boolean;
}

interface UseStudyContentSelectionArgs {
  subjects: CatalogSubject[];
  draft: ContentSelectionDraft;
  onChange: (content: ContentSelectionDraft) => void;
}

export interface UseStudyContentSelectionResult {
  subjectRail: SubjectRailItem[];
  activeSubject: CatalogSubject | null;
  searchQuery: string;
  topics: TopicSelectionItem[];
  selectedTopicsCount: number;
  selectedSubtopicsCount: number;
  activeSubjectSelectedTopicCount: number;
  feedbackMessage: string;
  selectSubject: (subjectId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTopicExpanded: (topicId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  toggleTopic: (topicId: string) => void;
  toggleSubtopic: (topicId: string, subtopicId: string) => void;
}

export function useStudyContentSelection({
  subjects,
  draft,
  onChange,
}: UseStudyContentSelectionArgs): UseStudyContentSelectionResult {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(
    () => new Set(),
  );

  const activeSubject =
    subjects.find((subject) => subject.id === activeSubjectId) ??
    subjects[0] ??
    null;

  const selectedMap = draft.selectedSubtopicIdsByTopicId;

  const subjectRail: SubjectRailItem[] = useMemo(
    () =>
      subjects.map((subject) => ({
        subjectId: subject.id,
        label: subject.label,
        icon: subject.icon,
        selectedTopicCount: countSelectedTopics(subject, selectedMap),
        isActive: subject.id === activeSubject?.id,
      })),
    [subjects, selectedMap, activeSubject],
  );

  const { selectedTopicsCount, selectedSubtopicsCount } = useMemo(() => {
    let topicCount = 0;
    let subtopicCount = 0;
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        const selected = selectedMap[topic.id] ?? [];
        if (selected.length > 0) topicCount += 1;
        subtopicCount += selected.length;
      }
    }
    return { selectedTopicsCount: topicCount, selectedSubtopicsCount: subtopicCount };
  }, [subjects, selectedMap]);

  const activeSubjectSelectedTopicCount = activeSubject
    ? countSelectedTopics(activeSubject, selectedMap)
    : 0;

  const query = searchQuery.trim().toLowerCase();

  const topics: TopicSelectionItem[] = useMemo(() => {
    if (!activeSubject) return [];
    return activeSubject.topics
      .filter((topic) => {
        if (!query) return true;
        if (topic.label.toLowerCase().includes(query)) return true;
        return topic.subtopics.some((subtopic) =>
          subtopic.label.toLowerCase().includes(query),
        );
      })
      .map((topic) => {
        const selectedSubtopicIds = selectedMap[topic.id] ?? [];
        const selectionState: TopicSelectionState =
          selectedSubtopicIds.length === 0
            ? "none"
            : selectedSubtopicIds.length === topic.subtopics.length
              ? "all"
              : "some";
        return {
          topicId: topic.id,
          label: topic.label,
          selectionState,
          expanded: expandedTopicIds.has(topic.id),
          subtopics: topic.subtopics.map((subtopic) => ({
            subtopicId: subtopic.id,
            label: subtopic.label,
            selected: selectedSubtopicIds.includes(subtopic.id),
          })),
        };
      });
  }, [activeSubject, selectedMap, expandedTopicIds, query]);

  const feedbackMessage = !activeSubject
    ? ""
    : activeSubjectSelectedTopicCount === 0
      ? `Select the topics you want from ${activeSubject.label}.`
      : `${activeSubjectSelectedTopicCount} topic${activeSubjectSelectedTopicCount === 1 ? "" : "s"} ready to schedule in ${activeSubject.label}.`;

  function selectSubject(subjectId: string) {
    setActiveSubjectId(subjectId);
    setSearchQuery("");
  }

  function toggleTopicExpanded(topicId: string) {
    setExpandedTopicIds((current) => {
      const next = new Set(current);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }

  function expandAll() {
    if (!activeSubject) return;
    setExpandedTopicIds(new Set(activeSubject.topics.map((topic) => topic.id)));
  }

  function collapseAll() {
    setExpandedTopicIds(new Set());
  }

  function toggleTopic(topicId: string) {
    if (!activeSubject) return;
    const topic = activeSubject.topics.find((item) => item.id === topicId);
    if (!topic) return;
    const currentlySelected = selectedMap[topicId] ?? [];
    const isFullySelected = currentlySelected.length === topic.subtopics.length;
    const nextSelected = isFullySelected
      ? []
      : topic.subtopics.map((subtopic) => subtopic.id);

    onChange({
      selectedSubtopicIdsByTopicId: {
        ...selectedMap,
        [topicId]: nextSelected,
      },
      libraryItemIds: draft.libraryItemIds ?? [],
    });
  }

  function toggleSubtopic(topicId: string, subtopicId: string) {
    const currentlySelected = selectedMap[topicId] ?? [];
    const nextSelected = currentlySelected.includes(subtopicId)
      ? currentlySelected.filter((id) => id !== subtopicId)
      : [...currentlySelected, subtopicId];

    onChange({
      selectedSubtopicIdsByTopicId: {
        ...selectedMap,
        [topicId]: nextSelected,
      },
      libraryItemIds: draft.libraryItemIds ?? [],
    });
  }

  return {
    subjectRail,
    activeSubject,
    searchQuery,
    topics,
    selectedTopicsCount,
    selectedSubtopicsCount,
    activeSubjectSelectedTopicCount,
    feedbackMessage,
    selectSubject,
    setSearchQuery,
    toggleTopicExpanded,
    expandAll,
    collapseAll,
    toggleTopic,
    toggleSubtopic,
  };
}
