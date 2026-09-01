import { useEffect } from "react";
import { LayoutPanelLeft } from "lucide-react";
import { DayStudyHeader } from "./header";
import AiGreetings from "./ai-greetings";
import AiSuggestions from "./ai-suggestions";
import AiConversation from "./ai-conversation";
import ChatComposer from "./chat-composer";
import AiSidebar from "./ai-sidebar";
import TipTapEditor from "./tip-tap-editor/tip-tap-editor";
import { ResponseStyleMenu } from "./response-style-menu";
import { StudyContentPanel } from "./study-content-panel";
import { DayAssessmentPanel } from "./assessment/day-assessment-panel";
import { AI_EXPLORE_PILLS, AI_SUGGESTIONS } from "../constants/ai-suggestions";
import {
  LEARNING_PROMPTS,
  isAssessmentFeature,
} from "../constants/features";
import { useAiResponse } from "../hooks/useAiResponse";
import { useDayStudyContext } from "../hooks/useDayStudyContext";
import { useCreateStudyNote } from "../../notes/hooks/useNotes";
import {
  resetDayStudyStore,
  selectComposerLocation,
  useDayStudyStore,
} from "../store/day-study-store";
import type { AiFollowUp, AiResponse } from "../types";

interface DayStudyPageProps {
  planId: string;
  dayNumber: number;
}

function topicTitleOf(tasks: { topicLabel: string; subtopicLabel: string | null }[]): string {
  const first = tasks[0];
  return first ? (first.subtopicLabel ?? first.topicLabel) : "";
}

const DayStudyPage = ({ planId, dayNumber }: DayStudyPageProps) => {
  const activeFeature = useDayStudyStore((state) => state.activeFeature);
  const setActiveFeature = useDayStudyStore((state) => state.setActiveFeature);
  const composerValue = useDayStudyStore((state) => state.composerValue);
  const composerMode = useDayStudyStore((state) => state.composerMode);
  const responseStyle = useDayStudyStore((state) => state.responseStyle);
  const conversation = useDayStudyStore((state) => state.conversation);
  const isAiThinking = useDayStudyStore((state) => state.isAiThinking);
  const focusSignal = useDayStudyStore((state) => state.focusSignal);
  const activeDocument = useDayStudyStore((state) => state.activeDocument);
  const isEditorOpen = useDayStudyStore((state) => state.isEditorOpen);
  const isAiSidebarExpanded = useDayStudyStore(
    (state) => state.isAiSidebarExpanded,
  );
  const setComposerValue = useDayStudyStore((state) => state.setComposerValue);
  const setComposerMode = useDayStudyStore((state) => state.setComposerMode);
  const setResponseStyle = useDayStudyStore((state) => state.setResponseStyle);
  const setAiSidebarExpanded = useDayStudyStore(
    (state) => state.setAiSidebarExpanded,
  );
  const openDocumentWorkspace = useDayStudyStore(
    (state) => state.openDocumentWorkspace,
  );
  const updateDocumentContent = useDayStudyStore(
    (state) => state.updateDocumentContent,
  );
  const returnToChat = useDayStudyStore((state) => state.returnToChat);
  const selectedNoteText = useDayStudyStore((state) => state.selectedNoteText);
  const setSelectedNoteText = useDayStudyStore(
    (state) => state.setSelectedNoteText,
  );
  const composerLocation = useDayStudyStore(selectComposerLocation);
  const hydrateFromContext = useDayStudyStore(
    (state) => state.hydrateFromContext,
  );

  const { data: context, isLoading } = useDayStudyContext(planId, dayNumber);
  const { sendMessage, isSending } = useAiResponse(planId, dayNumber);
  const createNote = useCreateStudyNote();

  // The store is a module singleton keyed to one (planId, dayNumber).
  useEffect(() => {
    resetDayStudyStore();
  }, [planId, dayNumber]);

  // Learning study is conversational, so picking a learning mode asks the
  // question rather than opening a second surface for it.
  useEffect(() => {
    if (!activeFeature || isAssessmentFeature(activeFeature)) return;
    void sendMessage(LEARNING_PROMPTS[activeFeature]);
    setActiveFeature(null);
  }, [activeFeature, sendMessage, setActiveFeature]);

  useEffect(() => {
    if (context) hydrateFromContext(context);
  }, [context, hydrateFromContext]);

  const hasConversation = conversation.length > 0 || isAiThinking;
  const showDocument = isEditorOpen && activeDocument !== null;
  const assessmentFeature =
    activeFeature && isAssessmentFeature(activeFeature) ? activeFeature : null;
  const inSidebar = composerLocation === "sidebar";

  const userName = context?.user.name ?? "there";
  const planName = context?.plan.name ?? "Study plan";
  const topicTitle = context ? topicTitleOf(context.day.tasks) : "";

  function handleSend(message: string) {
    void sendMessage(message);
  }

  function handleFollowUp(followUp: AiFollowUp) {
    handleSend(followUp.prompt);
  }

  const noteSourceLabel = topicTitle || planName;

  function handleSaveToNotes(response: AiResponse) {
    createNote.mutate({
      text: response.message,
      categoryId: "key-idea",
      sourceLabel: noteSourceLabel,
    });
  }

  function handleAddNote(text: string, categoryId: string) {
    createNote.mutate({ text, categoryId, sourceLabel: noteSourceLabel });
  }

  function leaveAssessment() {
    setActiveFeature(null);
  }

  /**
   * One composer instance description, rendered into whichever slot is active.
   * The value and mode live in the store, so moving slots keeps a draft intact.
   */
  const composer = (
    <ChatComposer
      value={composerValue}
      mode={composerMode}
      placeholder={
        inSidebar
          ? "Ask a follow-up…"
          : hasConversation
            ? "Continue the conversation…"
            : "Ask your AI tutor anything…"
      }
      disabled={isSending}
      focusSignal={focusSignal}
      compact={inSidebar}
      hideExtras={inSidebar}
      onChange={setComposerValue}
      onModeChange={setComposerMode}
      onSubmit={handleSend}
      controls={
        <ResponseStyleMenu
          value={responseStyle}
          disabled={isSending}
          onChange={setResponseStyle}
        />
      }
    />
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "var(--surface-canvas)",
        fontFamily: "var(--font-body)",
      }}
    >
      <DayStudyHeader
        planName={planName}
        dayNumber={dayNumber}
        topicTitle={isLoading ? "" : topicTitle}
      />

      <div
        style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}
      >
        {assessmentFeature ? (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: "28px 24px",
              boxSizing: "border-box",
            }}
          >
            <DayAssessmentPanel
              key={`${planId}-${dayNumber}`}
              planId={planId}
              dayNumber={dayNumber}
              feature={assessmentFeature}
              title={topicTitle || planName}
              onFeatureChange={setActiveFeature}
              onExit={leaveAssessment}
            />
          </div>
        ) : showDocument ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                overflowY: "auto",
                padding: "40px 48px",
                boxSizing: "border-box",
              }}
            >
              <TipTapEditor
                document={activeDocument}
                isSidebarExpanded={isAiSidebarExpanded}
                onReturnToChat={returnToChat}
                onUpdateDocumentContent={updateDocumentContent}
                selectedNoteText={selectedNoteText}
                onSelectedNoteTextChange={setSelectedNoteText}
                onAddNote={handleAddNote}
              />
            </div>

            <AiSidebar
              expanded={isAiSidebarExpanded}
              entries={conversation}
              isThinking={isAiThinking}
              composer={composer}
              onFollowUp={handleFollowUp}
              onToggle={setAiSidebarExpanded}
              onReturnToChat={returnToChat}
            />
          </div>
        ) : hasConversation ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "32px 40px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ maxWidth: 820, margin: "0 auto" }}>
                <AiConversation
                  entries={conversation}
                  isThinking={isAiThinking}
                  onFollowUp={handleFollowUp}
                  onSaveToNotes={handleSaveToNotes}
                />
              </div>
            </div>

            <div
              style={{
                flex: "0 0 auto",
                padding: "16px 40px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  maxWidth: 820,
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {activeDocument && !isAiThinking ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={openDocumentWorkspace}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        minHeight: 36,
                        padding: "8px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: 0,
                        background: "var(--accent)",
                        color: "var(--text-on-accent)",
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <LayoutPanelLeft size={16} />
                      Open study workspace
                    </button>
                  </div>
                ) : null}
                {composer}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "48px 32px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 28,
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <AiGreetings userName={userName} />

              <AiSuggestions
                suggestions={AI_SUGGESTIONS}
                explorePills={AI_EXPLORE_PILLS}
                onSelect={handleSend}
              />

              <div style={{ width: "100%", textAlign: "left" }}>{composer}</div>

              <StudyContentPanel
                key={`${planId}-${dayNumber}`}
                planId={planId}
                dayNumber={dayNumber}
              />

              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                AI responses may include mistakes. Please verify important
                information.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayStudyPage;