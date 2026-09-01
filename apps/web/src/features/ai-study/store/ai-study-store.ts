import { create } from "zustand";
import type {
  AiComposerMode,
  AiConversationEntry,
  AiDocument,
  AiResponse,
  AiResponseStyle,
  AssessmentFeature,
  ChatMessageDto,
  ComposerLocation,
} from "../../day-study/types";
import type { AiStudySessionDetail, StudyMode } from "../types";

/**
 * UI state for the AI Study workspace: which session is open, the composer's
 * draft and settings, and the rendered conversation.
 *
 * It mirrors `day-study-store` deliberately — same patterns, same naming — so
 * the two AI surfaces stay recognisably one feature. As there, in-progress
 * assessment state (current question, answers so far) is NOT kept here: it is
 * local to the runner, which does not need it shared or preserved across
 * switching away.
 *
 * A module-level singleton, so `resetAiStudyStore()` runs when the route
 * mounts and `hydrateFromSession()` whenever the open session changes.
 */
interface AiStudyState {
  activeSessionId: string | null;

  composerValue: string;
  composerMode: AiComposerMode;
  /** `null` until the student picks one — the composer shows a placeholder. */
  responseStyle: AiResponseStyle | null;
  studyMode: StudyMode;
  assessmentFeature: AssessmentFeature | null;

  conversation: AiConversationEntry[];
  isAiThinking: boolean;
  /**
   * The answer as it is being written. Held apart from `conversation` so the
   * settled turn — which also carries key points and follow-ups — is appended
   * once, rather than an entry being mutated on every token.
   */
  streamingMessage: string | null;
  /** The last turn's failure, cleared when the next one starts. */
  errorMessage: string | null;

  /**
   * Bumped once a response has fully settled. The composer focuses on the
   * change rather than on a render, so an unrelated re-render never steals
   * focus and a still-generating turn never pulls the caret away.
   */
  focusSignal: number;

  /** The long-form answer currently open in the document editor, if any. */
  activeDocument: AiDocument | null;
  isEditorOpen: boolean;
  isAiSidebarExpanded: boolean;

  setActiveSessionId: (sessionId: string | null) => void;
  hydrateFromSession: (session: AiStudySessionDetail) => void;

  setComposerValue: (value: string) => void;
  setComposerMode: (mode: AiComposerMode) => void;
  setResponseStyle: (style: AiResponseStyle) => void;
  setStudyMode: (mode: StudyMode) => void;
  setAssessmentFeature: (feature: AssessmentFeature | null) => void;

  appendUserMessage: (content: string) => void;
  startAiThinking: () => void;
  /** First token in: the thinking card gives way to the growing answer. */
  appendAiDelta: (text: string) => void;
  settleAiResponse: (response: AiResponse) => void;
  failAiResponse: (message: string) => void;

  /** Reopens the workspace on a document the conversation already produced. */
  openDocumentWorkspace: () => void;
  /** Persists the student's edits so the document survives closing the editor. */
  updateDocumentContent: (content: string) => void;
  /** "Return to chat" — closes the editor and brings the composer back. */
  returnToChat: () => void;
  setAiSidebarExpanded: (expanded: boolean) => void;
}

/** Derived, never stored — the composer only ever lives in one of two slots. */
export function selectComposerLocation(state: AiStudyState): ComposerLocation {
  return state.isEditorOpen ? "sidebar" : "main";
}

function tempId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Turns a persisted transcript back into rendered turns. Stored assistant
 * messages carry only their markdown, so the derived fields an in-flight
 * response has (key points, follow-ups) are empty on replay.
 */
function toConversation(messages: ChatMessageDto[]): AiConversationEntry[] {
  return messages.map((message) =>
    message.role === "user"
      ? {
          kind: "user" as const,
          message: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
          },
        }
      : {
          kind: "ai" as const,
          response: {
            id: message.id,
            message: message.content,
            keyPoints: [],
            sourceLabel: null,
            createdAt: message.createdAt,
            isLong: false,
            followUps: [],
          },
        },
  );
}

const INITIAL = {
  activeSessionId: null,
  composerValue: "",
  composerMode: "guided" as AiComposerMode,
  responseStyle: null as AiResponseStyle | null,
  studyMode: "learning" as StudyMode,
  assessmentFeature: null,
  conversation: [] as AiConversationEntry[],
  isAiThinking: false,
  streamingMessage: null as string | null,
  errorMessage: null,
  focusSignal: 0,
  activeDocument: null as AiDocument | null,
  isEditorOpen: false,
  isAiSidebarExpanded: true,
};

export const useAiStudyStore = create<AiStudyState>((set) => ({
  ...INITIAL,

  setActiveSessionId: (sessionId) =>
    set((state) =>
      state.activeSessionId === sessionId
        ? state
        : {
            activeSessionId: sessionId,
            conversation: [],
            composerValue: "",
            isAiThinking: false,
            streamingMessage: null,
            errorMessage: null,
            // A different session's document has no business staying open.
            activeDocument: null,
            isEditorOpen: false,
          },
    ),

  hydrateFromSession: (session) =>
    set((state) => {
      // Config always follows the server. The transcript is only replayed when
      // opening a session: a refetch mid-conversation would otherwise swap the
      // live turns for their stored text, dropping the key points and
      // follow-ups that only the in-flight response carries.
      const isSameOpenSession =
        state.activeSessionId === session.id && state.conversation.length > 0;
      return {
        activeSessionId: session.id,
        responseStyle: session.responseStyle,
        studyMode: session.studyMode,
        assessmentFeature: session.assessmentFeature,
        errorMessage: null,
        ...(isSameOpenSession
          ? {}
          : { conversation: toConversation(session.messages) }),
      };
    }),

  setComposerValue: (value) => set({ composerValue: value }),
  setComposerMode: (mode) => set({ composerMode: mode }),
  setResponseStyle: (style) => set({ responseStyle: style }),
  setStudyMode: (mode) => set({ studyMode: mode }),
  setAssessmentFeature: (feature) => set({ assessmentFeature: feature }),

  appendUserMessage: (content) =>
    set((state) => ({
      composerValue: "",
      errorMessage: null,
      streamingMessage: null,
      conversation: [
        ...state.conversation,
        {
          kind: "user",
          message: { id: tempId(), content, createdAt: new Date().toISOString() },
        },
      ],
    })),

  startAiThinking: () => set({ isAiThinking: true, streamingMessage: null }),

  appendAiDelta: (text) =>
    set((state) => ({
      isAiThinking: false,
      streamingMessage: (state.streamingMessage ?? "") + text,
    })),

  settleAiResponse: (response) =>
    set((state) => ({
      isAiThinking: false,
      streamingMessage: null,
      errorMessage: null,
      focusSignal: state.focusSignal + 1,
      conversation: [...state.conversation, { kind: "ai", response }],
      // A long response takes over the workspace: the editor opens on its
      // document and the composer moves into the (expanded) sidebar.
      activeDocument: response.document ?? state.activeDocument,
      isEditorOpen: response.isLong ? true : state.isEditorOpen,
      isAiSidebarExpanded: response.isLong ? true : state.isAiSidebarExpanded,
    })),

  failAiResponse: (message) =>
    set({ isAiThinking: false, streamingMessage: null, errorMessage: message }),

  openDocumentWorkspace: () =>
    set((state) =>
      state.activeDocument
        ? { isEditorOpen: true, isAiSidebarExpanded: true }
        : state,
    ),

  updateDocumentContent: (content) =>
    set((state) =>
      state.activeDocument
        ? { activeDocument: { ...state.activeDocument, content } }
        : state,
    ),

  returnToChat: () => set({ isEditorOpen: false }),

  setAiSidebarExpanded: (expanded) => set({ isAiSidebarExpanded: expanded }),
}));

/** Call when the route mounts — see the module doc above. */
export function resetAiStudyStore(): void {
  useAiStudyStore.setState({ ...INITIAL });
}
