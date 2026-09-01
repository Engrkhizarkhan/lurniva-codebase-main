import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Link2,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { authFetch } from "~/shared/lib/api-client";

interface DayContentSummary {
  attached: boolean;
  title?: string;
  overview?: string;
  chapterCount?: number;
  chapters?: { id: string; title: string; topics: string[] }[];
}

interface StudyContentPanelProps {
  planId: string;
  dayNumber: number;
}

const CONTAINER_STYLE = {
  boxSizing: "border-box" as const,
  width: "100%",
  maxWidth: 900,
  textAlign: "left" as const,
};

const CARD_STYLE: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  border: "1px dashed var(--border-default)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface-card)",
  padding: "16px 18px",
};

const TITLE_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text-heading)",
};

const INPUT_STYLE: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-default)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
};

export function StudyContentPanel({ planId, dayNumber }: StudyContentPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState<DayContentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await authFetch<{ content: DayContentSummary }>(
        `/api/ai/content/${planId}/${dayNumber}`,
      );
      if (result.success) setContent(result.data.content);
    } finally {
      setLoading(false);
    }
  }, [planId, dayNumber]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = pastedText.trim();
    if (text.length === 0 && !fileName) return;

    const form = new FormData();
    if (title.trim()) form.set("title", title.trim());
    if (text.length > 0) form.set("text", text);
    if (fileName && fileInputRef.current?.files?.[0]) {
      form.set("file", fileInputRef.current.files[0]);
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await authFetch<{ content: DayContentSummary }>(
        `/api/ai/content/${planId}/${dayNumber}`,
        { method: "POST", body: form },
      );
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      setContent(result.data.content);
      setFormOpen(false);
      setPastedText("");
      setFileName(null);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    const result = await authFetch<{ deleted: boolean }>(
      `/api/ai/content/${planId}/${dayNumber}`,
      { method: "DELETE" },
    );
    if (result.success) {
      setContent({ attached: false });
      setFormOpen(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div style={CONTAINER_STYLE}>
        <div style={{ ...CARD_STYLE, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Checking study content…
          </span>
        </div>
      </div>
    );
  }

  if (content?.attached) {
    return (
      <div style={CONTAINER_STYLE}>
        <div style={CARD_STYLE}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ ...TITLE_STYLE, minWidth: 0 }}>
              <FileText size={16} color="var(--color-forest-700)" />
              <span className="truncate">{content.title}</span>
            </div>
            <button
              type="button"
              onClick={remove}
              title="Remove study content"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: 0,
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <span style={{ color: "var(--text-body)" }}>{content.overview}</span>
            <div style={{ marginTop: 8 }}>
              {content.chapters?.map((chapter) => (
                <span
                  key={chapter.id}
                  title={chapter.topics.join(", ")}
                  style={{
                    display: "inline-block",
                    margin: "0 6px 6px 0",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  {chapter.title}
                </span>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-faint)" }}>
              Your tutor is now grounded in this material.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!formOpen) {
    return (
      <div style={CONTAINER_STYLE}>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-card)",
            padding: "10px 14px",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <Paperclip size={14} />
          Add your study material (PDF, Word, text, or paste)
        </button>
      </div>
    );
  }

  return (
    <div style={CONTAINER_STYLE}>
      <form
        onSubmit={submit}
        style={{ ...CARD_STYLE, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={TITLE_STYLE}>
          <UploadCloud size={16} color="var(--color-forest-700)" />
          Attach study content
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{ ...INPUT_STYLE, height: 38, padding: "0 12px" }}
        />

        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Or paste your material here (markdown / plain text)…"
          rows={4}
          style={{ ...INPUT_STYLE, padding: "10px 12px", resize: "vertical" }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-subtle)",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--text-body)",
            }}
          >
            <Link2 size={14} />
            {fileName ?? "Choose a file…"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown,.json,.html"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            PDF, Word (.docx), or text files.
          </span>
        </div>

        {error ? (
          <span style={{ fontSize: 13, color: "var(--color-ember-700)" }}>{error}</span>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={submitting || (pastedText.trim().length === 0 && !fileName)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: 0,
              borderRadius: "var(--radius-sm)",
              background: "var(--accent)",
              color: "var(--text-on-accent)",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UploadCloud size={14} />
            )}
            Distill &amp; attach
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            style={{
              border: 0,
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>

        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
          Content is distilled into chapters once; chat, notes and quizzes ground
          on the most relevant chapters.
        </span>
      </form>
    </div>
  );
}