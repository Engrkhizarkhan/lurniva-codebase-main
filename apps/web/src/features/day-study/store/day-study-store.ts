import { create } from "zustand";
import type {
  AiComposerMode,
  AiConversationEntry,
  AiDocument,
  AiFeature,
  AiResponse,
  AiResponseStyle,
  ChatMessageDto,
  ComposerLocation,
  DayStudyContext,
  LearningFeature,
} from "../types";

/**
 * Cross-cutting UI state for the day-study page: which mode is active, the
 * chat sidebar's messages/streaming, and each learning feature's generated
 * document (also streamed). Assessment views (flashcards/MCQs/short
 * questions/mock exam) intentionally do NOT live here — their in-progress
 * state (current question, answers so far) is local to each view and fed by
 * `useAiAssessment`, since it doesn't need to be shared or to survive
 * switching away from that view.
 *
 * This is a module-level singleton, so `resetDayStudyStore()` must be called
 * whenever the mounted (planId, dayNumber) changes — see `day-study-page.tsx`.
 */
interface DayStudyState {
  activeFeature: AiFeature | null;
  isChatOpen: boolean;

  chatMessages: ChatMessageDto[];
  isChatStreaming: boolean;
  streamingChatText: string;

  learningContent: Partial<Record<LearningFeature, string>>;
  streamingLearningFeature: LearningFeature | null;
  streamingLearningText: string;

  // --- AI interaction module ------------------------------------------------
  composerValue: string;
  composerMode: AiComposerMode;
  /** `null` until the student picks one — the composer shows a placeholder. */
  responseStyle: AiResponseStyle | null;
  conversation: AiConversationEntry[];
  isAiThinking: boolean;
  /**
   * Bumped once a response has fully settled. The composer focuses on the
   * change rather than on a render, so an unrelated re-render never steals
   * focus and a still-generating turn never pulls the caret away.
   */
  focusSignal: number;
  activeDocument: AiDocument | null;
  isEditorOpen: boolean;
  isAiSidebarExpanded: boolean;
  /** The text currently selected in the editor, awaiting a note category. */
  selectedNoteText: string | null;

  setActiveFeature: (feature: AiFeature | null) => void;
  setChatOpen: (open: boolean) => void;
  hydrateFromContext: (context: DayStudyContext) => void;

  appendUserChatMessage: (content: string) => void;
  startChatStream: () => void;
  appendChatStreamChunk: (chunk: string) => void;
  finishChatStream: () => void;
  failChatStream: () => void;

  startLearningStream: (feature: LearningFeature) => void;
  appendLearningStreamChunk: (chunk: string) => void;
  finishLearningStream: () => void;
  failLearningStream: (feature: LearningFeature) => void;

  setComposerValue: (value: string) => void;
  setComposerMode: (mode: AiComposerMode) => void;
  setResponseStyle: (style: AiResponseStyle) => void;
  appendUserMessage: (content: string) => void;
  startAiThinking: () => void;
  /** Adds the response and, when `isLong`, moves the UI into document mode. */
  settleAiResponse: (response: AiResponse) => void;
  failAiResponse: () => void;
  /** Reopens the workspace on a document the conversation already produced. */
  openDocumentWorkspace: () => void;
  /** Persists the student's edits so the document survives closing the editor. */
  updateDocumentContent: (content: string) => void;
  /** "Return to chat" — closes the editor and brings the composer back. */
  returnToChat: () => void;
  setAiSidebarExpanded: (expanded: boolean) => void;
  setSelectedNoteText: (text: string | null) => void;
}

/** Derived, never stored — the composer only ever lives in one of two slots. */
export function selectComposerLocation(state: DayStudyState): ComposerLocation {
  return state.isEditorOpen ? "sidebar" : "main";
}

function tempId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useDayStudyStore = create<DayStudyState>((set, get) => ({
  activeFeature: null,
  isChatOpen: false,

  chatMessages: [],
  isChatStreaming: false,
  streamingChatText: "",

  learningContent: {},
  streamingLearningFeature: null,
  streamingLearningText: "",

  composerValue: "",
  composerMode: "guided",
  responseStyle: null,
  conversation: [],
  isAiThinking: false,
  focusSignal: 0,
  activeDocument: null,
  isEditorOpen: false,
  isAiSidebarExpanded: true,
  selectedNoteText: null,

  setActiveFeature: (feature) => set({ activeFeature: feature }),
  setChatOpen: (open) => set({ isChatOpen: open }),

  hydrateFromContext: (context) =>
    set({
      chatMessages: context.chat.messages,
      learningContent: Object.fromEntries(
        Object.entries(context.learningContent).map(([feature, value]) => [
          feature,
          value?.content ?? "",
        ]),
      ) as Partial<Record<LearningFeature, string>>,
    }),

  appendUserChatMessage: (content) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: tempId(), role: "user", content, createdAt: new Date().toISOString() },
      ],
    })),

  startChatStream: () => set({ isChatStreaming: true, streamingChatText: "" }),
  appendChatStreamChunk: (chunk) =>
    set((state) => ({ streamingChatText: state.streamingChatText + chunk })),
  finishChatStream: () => {
    const { streamingChatText } = get();
    set((state) => ({
      isChatStreaming: false,
      streamingChatText: "",
      chatMessages: [
        ...state.chatMessages,
        {
          id: tempId(),
          role: "assistant",
          content: streamingChatText,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },
  failChatStream: () => set({ isChatStreaming: false, streamingChatText: "" }),

  startLearningStream: (feature) =>
    set({ streamingLearningFeature: feature, streamingLearningText: "" }),
  appendLearningStreamChunk: (chunk) =>
    set((state) => ({ streamingLearningText: state.streamingLearningText + chunk })),
  finishLearningStream: () => {
    const { streamingLearningFeature, streamingLearningText } = get();
    if (!streamingLearningFeature) return;
    set((state) => ({
      streamingLearningFeature: null,
      streamingLearningText: "",
      learningContent: {
        ...state.learningContent,
        [streamingLearningFeature]: streamingLearningText,
      },
    }));
  },
  failLearningStream: () => set({ streamingLearningFeature: null, streamingLearningText: "" }),

  setComposerValue: (value) => set({ composerValue: value }),
  setComposerMode: (mode) => set({ composerMode: mode }),
  setResponseStyle: (style) => set({ responseStyle: style }),

  appendUserMessage: (content) =>
    set((state) => ({
      composerValue: "",
      conversation: [
        ...state.conversation,
        {
          kind: "user",
          message: { id: tempId(), content, createdAt: new Date().toISOString() },
        },
      ],
    })),

  startAiThinking: () => set({ isAiThinking: true }),

  settleAiResponse: (response) =>
    set((state) => ({
      isAiThinking: false,
      focusSignal: state.focusSignal + 1,
      conversation: [...state.conversation, { kind: "ai", response }],
      // A long response takes over the workspace: the editor opens on its
      // document and the composer moves into the (expanded) sidebar.
      activeDocument: response.document ?? state.activeDocument,
      isEditorOpen: response.isLong ? true : state.isEditorOpen,
      isAiSidebarExpanded: response.isLong ? true : state.isAiSidebarExpanded,
    })),

  failAiResponse: () => set({ isAiThinking: false }),

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

  // The document stays in state so the "Open study workspace" action can bring
  // it back; only the long-document *interaction* ends here.
  returnToChat: () => set({ isEditorOpen: false, selectedNoteText: null }),

  setAiSidebarExpanded: (expanded) => set({ isAiSidebarExpanded: expanded }),
  setSelectedNoteText: (text) => set({ selectedNoteText: text }),
}));

/** Call on mount/unmount for a given (planId, dayNumber) — see the module doc above. */
export function resetDayStudyStore(): void {
  useDayStudyStore.setState({
    activeFeature: null,
    isChatOpen: false,
    chatMessages: [],
    isChatStreaming: false,
    streamingChatText: "",
    learningContent: {},
    streamingLearningFeature: null,
    streamingLearningText: "",
    composerValue: "",
    composerMode: "guided",
    responseStyle: null,
    conversation: [],
    isAiThinking: false,
    focusSignal: 0,
    activeDocument: null,
    isEditorOpen: false,
    isAiSidebarExpanded: true,
    selectedNoteText: null,
  });
}
