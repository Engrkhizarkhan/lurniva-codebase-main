import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import EditorToolbar from "./editor-toolbar";
import NoteSelectionMenu from "./note-selection-menu";
import type { SelectionAnchor } from "./note-selection-menu";
import type { AiDocument, NoteCategory } from "../../types";
import TextActionButton from "shared/components/text-action-button";
import { ArrowLeft } from "lucide-react";

const EDITOR_CLASS = "lurniva-doc";

/**
 * Element styles for the document body. Inline styles can't reach ProseMirror's
 * generated children, so the design's block rules live here instead.
 */
const EDITOR_STYLES = `
.${EDITOR_CLASS} .ProseMirror { outline: none; }
.${EDITOR_CLASS} .ProseMirror > * + * { margin-top: 14px; }
.${EDITOR_CLASS} h1, .${EDITOR_CLASS} h2, .${EDITOR_CLASS} h3 {
  font-family: var(--font-display); font-weight: 700;
  color: var(--text-heading); line-height: var(--lh-heading); margin: 0;
}
.${EDITOR_CLASS} h1 { font-size: 26px; }
.${EDITOR_CLASS} h2 { font-size: 22px; }
.${EDITOR_CLASS} h3 { font-size: 18px; }
.${EDITOR_CLASS} p { margin: 0; }
.${EDITOR_CLASS} ul, .${EDITOR_CLASS} ol { margin: 0; padding-left: 20px; }
.${EDITOR_CLASS} li + li { margin-top: 4px; }
.${EDITOR_CLASS} blockquote {
  margin: 0; padding: 10px 16px;
  border-left: 3px solid var(--color-lime-500);
  background: var(--role-ai-soft);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.${EDITOR_CLASS} blockquote p { margin: 0; }
.${EDITOR_CLASS} pre {
  font-family: var(--font-mono); font-size: 14px;
  background: var(--surface-sunken); border-radius: var(--radius-md); padding: 14px;
}
.${EDITOR_CLASS} a { color: var(--text-link); text-decoration: underline; }
.${EDITOR_CLASS} mark { border-radius: var(--radius-xs); padding: 0 2px; }
`;

interface TipTapEditorProps {
  document: AiDocument;
  isSidebarExpanded: boolean;
  onReturnToChat: () => void;
  onUpdateDocumentContent: (content: string) => void;
  /**
   * The text-selection → note-category interaction. Day-study's notes feature;
   * omit all three on a surface with no notes concept (the editor still works,
   * just without the "save to notes" popup on selection).
   */
  selectedNoteText?: string | null;
  onSelectedNoteTextChange?: (text: string | null) => void;
  onAddNote?: (text: string, categoryId: string) => void;
}

/**
 * The rich-text surface for long AI answers. Owns the editor instance and,
 * when the notes callbacks are supplied, the text-selection → note-category
 * interaction.
 */
const TipTapEditor = ({
  document: aiDocument,
  isSidebarExpanded,
  onReturnToChat,
  onUpdateDocumentContent,
  selectedNoteText = null,
  onSelectedNoteTextChange,
  onAddNote,
}: TipTapEditorProps) => {
  const [anchor, setAnchor] = useState<SelectionAnchor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notesEnabled = Boolean(onSelectedNoteTextChange && onAddNote);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: aiDocument.content,
    // The app server-renders; ProseMirror must wait for the client.
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { "aria-label": aiDocument.title } },
  });

  // A new long response replaces the document in place.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(aiDocument.content);
  }, [editor, aiDocument.id, aiDocument.content]);

  // Flush edits back to the store on teardown (collapse, return to chat) rather
  // than on every keystroke, which would fight the effect above for the cursor.
  useEffect(() => {
    if (!editor) return;
    return () => onUpdateDocumentContent(editor.getHTML());
  }, [editor, onUpdateDocumentContent]);

  const clearSelection = useCallback(() => {
    const selection = editor?.state.selection;

    if (!selection) {
      // Optionally focus editor even if no selection yet
      editor?.commands.focus();
      setAnchor(null);
      onSelectedNoteTextChange?.(null);
      return;
    }

    const { head } = selection; // head is definitely a number here

    editor?.commands.setTextSelection(head);
    editor?.commands.focus();
    setAnchor(null);
    onSelectedNoteTextChange?.(null);
  }, [editor, setAnchor, onSelectedNoteTextChange]);

  const handleSelectionEnd = useCallback(() => {
    if (!notesEnabled) return;

    const container = containerRef.current;
    const selection = window.getSelection();

    if (
      !container ||
      !selection ||
      selection.isCollapsed ||
      selection.rangeCount === 0 ||
      !selection.focusNode
    ) {
      clearSelection();
      return;
    }

    const text = selection.toString().trim();

    if (!text) {
      clearSelection();
      return;
    }

    const focusRange = document.createRange();

    try {
      focusRange.setStart(selection.focusNode, selection.focusOffset);
      focusRange.collapse(true);

      const cursorRect = focusRange.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const popupWidth = 220;
      const popupHeight = 40;
      const gap = 8;

      // Cursor position relative to the container
      const cursorLeft = cursorRect.left - containerRect.left;
      const cursorTop = cursorRect.top - containerRect.top;

      // Position directly above the cursor
      const top = cursorTop - popupHeight - gap;

      // Center popup horizontally around cursor
      const left = cursorLeft - popupWidth / 2;

      // Prevent horizontal overflow
      const clampedLeft = Math.max(
        8,
        Math.min(left, containerRect.width - popupWidth - 8),
      );

      // If there isn't enough space above, place it below instead
      const clampedTop =
        top >= 8 ? top : cursorRect.bottom - containerRect.top + gap;

      setAnchor({
        top: clampedTop,
        left: clampedLeft,
      });

      onSelectedNoteTextChange?.(text);
    } catch {
      clearSelection();
    }
  }, [clearSelection, notesEnabled, onSelectedNoteTextChange]);

  function handleAddToNotes(category: NoteCategory) {
    if (!editor || !selectedNoteText) return;
    editor.chain().focus().setHighlight({ color: category.color }).run();
    onAddNote?.(selectedNoteText, category.id);
    setAnchor(null);
    // clear selected text after adding it to notes
    window.getSelection()?.removeAllRanges();
  }

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className={EDITOR_CLASS}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 760,
        margin: "0 auto",
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{EDITOR_STYLES}</style>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "var(--track-caps)",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            Study workspace
          </span>
          {!isSidebarExpanded && (
            <TextActionButton onClick={onReturnToChat}>
              <ArrowLeft size={14} />
              <span>Return to chat</span>
            </TextActionButton>
          )}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 26,
            lineHeight: "var(--lh-heading)",
            letterSpacing: "var(--track-heading)",
            color: "var(--text-heading)",
            margin: "6px 0 0",
          }}
        >
          {aiDocument.title}
        </h1>
      </div>

      <EditorToolbar editor={editor} />

      <div
        onMouseUp={notesEnabled ? handleSelectionEnd : undefined}
        onKeyUp={notesEnabled ? handleSelectionEnd : undefined}
        style={{
          background: "white",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xs)",
          padding: 40,
          minHeight: 520,
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--text-body)",
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {notesEnabled && anchor && selectedNoteText ? (
        <NoteSelectionMenu
          selectedText={selectedNoteText}
          anchor={anchor}
          onAddToNotes={handleAddToNotes}
          onDismiss={clearSelection}
        />
      ) : null}
    </div>
  );
};

export default TipTapEditor;
