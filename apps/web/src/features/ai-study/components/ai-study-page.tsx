import { useEffect, useState } from "react";
import { AlertCircle, LayoutPanelLeft, Loader2, Sparkles, SquarePen } from "lucide-react";
import { Button } from "@lurniva/ui";
import AiConversation from "../../day-study/components/ai-conversation";
import AiSidebar from "../../day-study/components/ai-sidebar";
import AiSuggestions from "../../day-study/components/ai-suggestions";
import ChatComposer from "../../day-study/components/chat-composer";
import { ResponseStyleMenu } from "../../day-study/components/response-style-menu";
import TipTapEditor from "../../day-study/components/tip-tap-editor/tip-tap-editor";
import {
  AI_EXPLORE_PILLS,
  AI_SUGGESTIONS,
} from "../../day-study/constants/ai-suggestions";
import type { AssessmentCounts } from "../../day-study/lib/assessment-plan";
import type {
  AiFollowUp,
  AiResponse,
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "../../day-study/types";
import { useCreateStudyNote } from "../../notes/hooks/useNotes";
import { useAiStudyRespond } from "../hooks/useAiStudyRespond";
import { useGenerateAiStudyAssessment } from "../hooks/useAiStudyAssessment";
import {
  useAiStudySession,
  useAiStudySessions,
  useCreateAiStudySession,
  useDeleteAiStudySession,
  useUpdateAiStudySession,
} from "../hooks/useAiStudySessions";
import { resetAiStudyStore, useAiStudyStore } from "../store/ai-study-store";
import type { StudyContextRef, StudyMode } from "../types";
import { AiStudyHeader } from "./ai-study-header";
import { AssessmentRun, AssessmentSetup } from "./assessment/assessment-workspace";
import { SessionHistoryMenu } from "./session-history-menu";

/**
 * The dedicated AI Study workspace: one session at a time, with its history a
 * dropdown away.
 *
 * It is deliberately built from the day-study chat parts — `ChatComposer`,
 * `AiConversation`, the assessment components — rather than a parallel set, so
 * there is one chat system and one assessment system in the product. What is
 * new here is session persistence and a topic context that belongs to the
 * session rather than to a plan day.
 */
export function AiStudyPage() {
  const [assessment, setAssessment] = useState<GenerateAssessmentResponse | null>(null);
  const [isAttemptComplete, setAttemptComplete] = useState(false);
  // Ephemeral popup state for the editor's text-selection → note interaction —
  // not shared with anything else, so it stays local rather than in the store.
  const [selectedNoteText, setSelectedNoteText] = useState<string | null>(null);

  const activeSessionId = useAiStudyStore((state) => state.activeSessionId);
  const composerValue = useAiStudyStore((state) => state.composerValue);
  const composerMode = useAiStudyStore((state) => state.composerMode);
  const responseStyle = useAiStudyStore((state) => state.responseStyle);
  const studyMode = useAiStudyStore((state) => state.studyMode);
  const assessmentFeature = useAiStudyStore((state) => state.assessmentFeature);
  const conversation = useAiStudyStore((state) => state.conversation);
  const isAiThinking = useAiStudyStore((state) => state.isAiThinking);
  const streamingMessage = useAiStudyStore((state) => state.streamingMessage);
  const errorMessage = useAiStudyStore((state) => state.errorMessage);
  const focusSignal = useAiStudyStore((state) => state.focusSignal);
  const activeDocument = useAiStudyStore((state) => state.activeDocument);
  const isEditorOpen = useAiStudyStore((state) => state.isEditorOpen);
  const isAiSidebarExpanded = useAiStudyStore((state) => state.isAiSidebarExpanded);

  const setActiveSessionId = useAiStudyStore((state) => state.setActiveSessionId);
  const hydrateFromSession = useAiStudyStore((state) => state.hydrateFromSession);
  const setComposerValue = useAiStudyStore((state) => state.setComposerValue);
  const setComposerMode = useAiStudyStore((state) => state.setComposerMode);
  const setResponseStyle = useAiStudyStore((state) => state.setResponseStyle);
  const setStudyMode = useAiStudyStore((state) => state.setStudyMode);
  const setAssessmentFeature = useAiStudyStore((state) => state.setAssessmentFeature);
  const setAiSidebarExpanded = useAiStudyStore((state) => state.setAiSidebarExpanded);
  const openDocumentWorkspace = useAiStudyStore((state) => state.openDocumentWorkspace);
  const updateDocumentContent = useAiStudyStore((state) => state.updateDocumentContent);
  const returnToChat = useAiStudyStore((state) => state.returnToChat);

  const sessionsQuery = useAiStudySessions();
  const sessionQuery = useAiStudySession(activeSessionId);
  const createSession = useCreateAiStudySession();
  const updateSession = useUpdateAiStudySession(activeSessionId);
  const deleteSession = useDeleteAiStudySession();
  const { sendMessage, isSending } = useAiStudyRespond(activeSessionId);
  const createNote = useCreateStudyNote();
  const generateAssessment = useGenerateAiStudyAssessment(activeSessionId);

  // The store is a module singleton shared by every mount of this route.
  useEffect(() => {
    resetAiStudyStore();
  }, []);

  const sessions = sessionsQuery.data;
  useEffect(() => {
    if (!sessions || activeSessionId) return;
    const first = sessions[0];
    if (first) setActiveSessionId(first.id);
  }, [sessions, activeSessionId, setActiveSessionId]);

  const sessionDetail = sessionQuery.data;
  useEffect(() => {
    if (sessionDetail) hydrateFromSession(sessionDetail);
  }, [sessionDetail, hydrateFromSession]);

  const context = sessionDetail?.context ?? null;
  const hasTopic = context !== null && context.ref.kind !== "general";
  const hasConversation =
    conversation.length > 0 || isAiThinking || streamingMessage !== null;
  // Assessment always wins the content area (see the branching below), so the
  // composer only actually moves into the sidebar when the document is the
  // thing on screen — otherwise it would vanish rather than relocate.
  const showDocument =
    studyMode !== "assessment" && isEditorOpen && activeDocument !== null;
  const inSidebar = showDocument;

  /**
   * An untouched session is already the blank one a student would be asking
   * for, so starting another would only leave an empty row in the history.
   */
  const activeSummary = sessions?.find((session) => session.id === activeSessionId);
  const canStartNewSession =
    !activeSummary || activeSummary.messageCount > 0 || conversation.length > 0;

  /** Drops any run in progress — switching sessions or topics invalidates it. */
  function clearAssessment() {
    setAssessment(null);
    setAttemptComplete(false);
  }

  function openSession(sessionId: string) {
    clearAssessment();
    setActiveSessionId(sessionId);
  }

  async function startNewSession() {
    const session = await createSession.mutateAsync({
      context: { kind: "general" },
      responseStyle,
      studyMode,
    });
    openSession(session.id);
  }

  async function removeSession(sessionId: string) {
    await deleteSession.mutateAsync(sessionId);
    if (sessionId === activeSessionId) {
      clearAssessment();
      setActiveSessionId(null);
    }
  }

  function handleTopicChange(ref: StudyContextRef) {
    clearAssessment();
    updateSession.mutate({ context: ref });
  }

  function handleStudyModeChange(mode: StudyMode) {
    setStudyMode(mode);
    clearAssessment();
    updateSession.mutate({ studyMode: mode });
  }

  function handleResponseStyleChange(style: Parameters<typeof setResponseStyle>[0]) {
    setResponseStyle(style);
    updateSession.mutate({ responseStyle: style });
  }

  function handleSend(message: string) {
    // Asking a question is always a conversation, so a question typed while
    // setting up an assessment takes the student back to the transcript rather
    // than disappearing into a screen that cannot show the answer.
    if (studyMode === "assessment") handleStudyModeChange("learning");
    void sendMessage(message).catch(() => undefined);
  }

  function handleStartAssessment(
    feature: AssessmentFeature,
    counts: Partial<AssessmentCounts>,
  ) {
    setAssessmentFeature(feature);
    generateAssessment.mutate(
      { feature, counts },
      { onSuccess: (result) => setAssessment(result) },
    );
  }

  const noteSourceLabel = context?.label ?? "AI Study";

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

  /**
   * One composer instance, rendered into whichever slot is active — the main
   * footer, or the sidebar once a long answer opens the document editor.
   */
  const composer = (
    <div className="grid gap-2">
      {errorMessage ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-error-soft px-3 py-2 text-sm text-error"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {errorMessage}
        </p>
      ) : null}
      <ChatComposer
        value={composerValue}
        mode={composerMode}
        placeholder={
          inSidebar
            ? "Ask a follow-up…"
            : studyMode === "assessment"
              ? hasTopic
                ? `Ask Lurniva anything about ${context?.label}…`
                : "Ask Lurniva anything…"
              : hasConversation
                ? "Ask a follow-up…"
                : hasTopic
                  ? `Ask anything about ${context?.label}…`
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
            onChange={handleResponseStyleChange}
          />
        }
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-canvas">
      <AiStudyHeader
        context={context}
        studyMode={studyMode}
        isUpdating={updateSession.isPending}
        disabled={sessionQuery.isLoading || !activeSessionId}
        isCreatingSession={createSession.isPending}
        canStartNewSession={canStartNewSession}
        onTopicChange={handleTopicChange}
        onStudyModeChange={handleStudyModeChange}
        onNewSession={() => void startNewSession()}
        historyMenu={
          <SessionHistoryMenu
            sessions={sessionsQuery.data ?? []}
            activeSessionId={activeSessionId}
            isLoading={sessionsQuery.isLoading}
            isError={sessionsQuery.isError}
            onRetry={() => void sessionsQuery.refetch()}
            onSelect={openSession}
            onDelete={(sessionId) => void removeSession(sessionId)}
          />
        }
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {sessionsQuery.isLoading ? (
          <div className="grid flex-1 place-items-center">
            <Loader2 size={22} className="animate-spin text-text-faint" />
          </div>
        ) : !activeSessionId ? (
          <NoSessionState
            isCreating={createSession.isPending}
            onStart={() => void startNewSession()}
          />
        ) : sessionQuery.isLoading ? (
          <div className="grid flex-1 place-items-center">
            <Loader2 size={22} className="animate-spin text-text-faint" />
          </div>
        ) : sessionQuery.isError ? (
          <ErrorState
            message="This conversation could not be opened."
            onRetry={() => void sessionQuery.refetch()}
          />
        ) : studyMode === "assessment" ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {assessment ? (
                <AssessmentRun
                  assessment={assessment}
                  topicLabel={context?.label ?? null}
                  isComplete={isAttemptComplete}
                  onCompleted={() => setAttemptComplete(true)}
                  onRestart={clearAssessment}
                  onExit={clearAssessment}
                  onAskAi={handleSend}
                />
              ) : (
                <AssessmentSetup
                  topicLabel={context?.label ?? null}
                  hasTopic={hasTopic}
                  feature={assessmentFeature}
                  isGenerating={generateAssessment.isPending}
                  errorMessage={generateAssessment.error?.message ?? null}
                  onFeatureChange={setAssessmentFeature}
                  onStart={handleStartAssessment}
                />
              )}
            </div>

            <div className="border-t border-border-subtle px-4 py-3 md:px-8">
              <div className="mx-auto max-w-3xl">{composer}</div>
            </div>
          </>
        ) : showDocument && activeDocument ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="min-w-0 flex-1 overflow-y-auto px-8 py-10">
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
              streamingMessage={streamingMessage}
              composer={composer}
              onFollowUp={(followUp: AiFollowUp) => handleSend(followUp.prompt)}
              onToggle={setAiSidebarExpanded}
              onReturnToChat={returnToChat}
            />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {hasConversation ? (
                <div className="px-4 py-6 md:px-8">
                  <div className="mx-auto max-w-3xl">
                    <AiConversation
                      entries={conversation}
                      isThinking={isAiThinking}
                      streamingMessage={streamingMessage}
                      onFollowUp={(followUp: AiFollowUp) => handleSend(followUp.prompt)}
                      onSaveToNotes={handleSaveToNotes}
                    />
                  </div>
                </div>
              ) : (
                <LearningEmptyState
                  topicLabel={context?.label ?? null}
                  onSelect={handleSend}
                />
              )}
            </div>

            <div className="border-t border-border-subtle px-4 py-3 md:px-8">
              <div className="mx-auto grid max-w-3xl gap-2">
                {activeDocument && !isAiThinking ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={openDocumentWorkspace}
                      className="inline-flex items-center gap-2 rounded-control bg-accent px-3.5 py-2 text-sm font-semibold text-text-on-accent transition-colors duration-150 hover:bg-accent-hover"
                    >
                      <LayoutPanelLeft size={16} />
                      Open study workspace
                    </button>
                  </div>
                ) : null}
                {composer}
                <p className="text-center text-xs text-text-faint">
                  AI responses may include mistakes. Please verify important
                  information.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function NoSessionState({
  isCreating,
  onStart,
}: {
  isCreating: boolean;
  onStart: () => void;
}) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <div className="grid max-w-md justify-items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-role-ai-soft text-role-ai-ink">
          <Sparkles size={28} />
        </span>
        <div className="grid gap-1.5">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.01em] text-text-heading">
            Start studying with AI
          </h2>
          <p className="text-sm text-text-muted">
            Pick a topic from your subjects, library or study plan, then learn it
            conversationally or test yourself on it.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={isCreating}
          onClick={onStart}
          icon={
            isCreating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <SquarePen size={15} />
            )
          }
        >
          New session
        </Button>
      </div>
    </div>
  );
}

function LearningEmptyState({
  topicLabel,
  onSelect,
}: {
  topicLabel: string | null;
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-3xl justify-items-center gap-6 text-center">
        <div className="grid gap-1.5">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.01em] text-text-heading">
            {topicLabel ? `Studying ${topicLabel}` : "What would you like to study?"}
          </h2>
          <p className="text-sm text-text-muted">
            {topicLabel
              ? "Ask anything about it, or start with one of these."
              : "Choose a topic above to ground your tutor, or just start asking."}
          </p>
        </div>
        <AiSuggestions
          suggestions={AI_SUGGESTIONS}
          explorePills={AI_EXPLORE_PILLS}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid flex-1 place-items-center px-6">
      <div className="grid justify-items-center gap-2 text-center">
        <AlertCircle size={22} className="text-error" />
        <p className="text-sm text-text-body">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold text-text-link hover:text-text-link-hover"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
