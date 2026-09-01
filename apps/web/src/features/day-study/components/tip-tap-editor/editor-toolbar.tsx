import { useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

const HIGHLIGHT_COLOR = "var(--color-lime-100)";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}

const ToolButton = ({ label, icon, active = false, onClick }: ToolButtonProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34,
        height: 34,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        borderRadius: "var(--radius-sm)",
        background: active
          ? "var(--primary-soft)"
          : hovered
            ? "var(--surface-sunken)"
            : "transparent",
        color: "var(--primary)",
        cursor: "pointer",
        transition: "background var(--dur-hover) var(--ease-standard)",
      }}
    >
      {icon}
    </button>
  );
};

const ToolDivider = () => (
  <span
    style={{ width: 1, background: "var(--border-subtle)", margin: "4px" }}
    aria-hidden
  />
);

/** The formatting rail above the document, in the design's tool order. */
const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        padding: 8,
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        background: "white",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <ToolButton
        label="Undo"
        icon={<Undo2 size={16} />}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolButton
        label="Redo"
        icon={<Redo2 size={16} />}
        onClick={() => editor.chain().focus().redo().run()}
      />
      <ToolDivider />
      <ToolButton
        label="Heading 1"
        icon={<Heading1 size={16} />}
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolButton
        label="Heading 2"
        icon={<Heading2 size={16} />}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolDivider />
      <ToolButton
        label="Bold"
        icon={<Bold size={16} />}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        label="Italic"
        icon={<Italic size={16} />}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton
        label="Underline"
        icon={<UnderlineIcon size={16} />}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolButton
        label="Strikethrough"
        icon={<Strikethrough size={16} />}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolDivider />
      <ToolButton
        label="Bullet list"
        icon={<List size={16} />}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        label="Numbered list"
        icon={<ListOrdered size={16} />}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton
        label="Quote"
        icon={<Quote size={16} />}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolButton
        label="Code block"
        icon={<Code size={16} />}
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolDivider />
      <ToolButton
        label="Align left"
        icon={<AlignLeft size={16} />}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolButton
        label="Align center"
        icon={<AlignCenter size={16} />}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolButton
        label="Align right"
        icon={<AlignRight size={16} />}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />
      <ToolDivider />
      <ToolButton
        label="Insert link"
        icon={<LinkIcon size={16} />}
        active={editor.isActive("link")}
        onClick={setLink}
      />
      <ToolButton
        label="Highlight"
        icon={<Highlighter size={16} />}
        active={editor.isActive("highlight")}
        onClick={() =>
          editor.chain().focus().toggleHighlight({ color: HIGHLIGHT_COLOR }).run()
        }
      />
    </div>
  );
};

export default EditorToolbar;
