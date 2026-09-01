import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { FileText, Sparkles, UploadCloud, X } from "lucide-react";
import { Button, cn } from "@lurniva/ui";
import { MIN_LIBRARY_TEXT_LENGTH } from "@lurniva/validation";
import {
  SUPPORTED_UPLOAD_EXTENSIONS,
  UPLOAD_ACCEPT,
  UPLOAD_ACCEPT_LABEL,
} from "../constants/supported-files";
import type { AddLibraryContentInput } from "../types";

interface AddContentDialogProps {
  onClose: () => void;
  /** Hands the chosen sources to the upload queue — one entry per item. */
  onAdd: (inputs: AddLibraryContentInput[]) => void;
}

function isSupported(file: File): boolean {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  return SUPPORTED_UPLOAD_EXTENSIONS.includes(
    extension as (typeof SUPPORTED_UPLOAD_EXTENSIONS)[number],
  );
}

/**
 * Collects what the student wants to add — one or more documents, or a block
 * of pasted text. It never uploads anything itself: it validates the choice
 * and hands it to the caller, which owns the queue.
 *
 * Mounted only while open, so closing it discards the draft with the instance
 * rather than needing a reset pass.
 */
export function AddContentDialog({ onClose, onAdd }: AddContentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasText = text.trim().length >= MIN_LIBRARY_TEXT_LENGTH;
  const canSubmit = files.length > 0 || hasText;
  const showTitleField = files.length <= 1;

  function acceptFiles(incoming: File[]) {
    setRejected(
      incoming.filter((file) => !isSupported(file)).map((f) => f.name),
    );
    const supported = incoming.filter(isSupported);
    if (supported.length === 0) return;
    setFiles((current) => [...current, ...supported]);
    setTitle((current) =>
      current || supported.length > 1
        ? current
        : (supported[0]?.name.replace(/\.[^.]+$/, "") ?? ""),
    );
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    acceptFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFiles(Array.from(event.dataTransfer.files));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, position) => position !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    // A single file can carry the typed title/description; a batch keeps each
    // file's own name so the items stay distinguishable in the library.
    const inputs: AddLibraryContentInput[] = files.map((file) => ({
      title: files.length === 1 ? title : undefined,
      description: files.length === 1 ? description : undefined,
      file,
      text: "",
    }));

    if (hasText) {
      inputs.push({ title, description, file: null, text: text.trim() });
    }

    onAdd(inputs);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-surface-overlay p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Add content to your library"
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-modal bg-surface-raised p-7 shadow-modal"
      >
        <div className="flex items-start gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span
              style={{ letterSpacing: "var(--track-caps)" }}
              className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase"
            >
              <Sparkles size={14} />
              Add to library
            </span>
            <h2 className="font-display text-2xl font-bold text-text-heading">
              What are we studying?
            </h2>
            <p className="text-sm leading-relaxed text-text-muted">
              Drop in your notes or a textbook chapter. We turn each one into
              chapters you can study, chat about and get quizzed on.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle"
          >
            <X size={18} />
          </button>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-2 rounded-card border border-dashed px-6 py-8 text-center transition-colors",
            isDragging
              ? "border-border-strong bg-accent-soft"
              : "border-border-default bg-surface-card",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-control bg-surface-subtle text-primary">
            <UploadCloud size={20} />
          </span>
          <p className="text-sm font-semibold text-text-heading">
            Drag files here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-text-link underline underline-offset-2 hover:text-text-link-hover"
            >
              browse your device
            </button>
          </p>
          <p className="text-xs text-text-faint">
            {UPLOAD_ACCEPT_LABEL} · add as many as you like
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            multiple
            hidden
            onChange={handleFileInput}
          />
        </div>

        {rejected.length > 0 ? (
          <p role="alert" className="text-xs text-error">
            We can&apos;t read {rejected.join(", ")}. Supported formats are{" "}
            {UPLOAD_ACCEPT_LABEL}.
          </p>
        ) : null}

        {files.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center gap-3 rounded-control border border-border-subtle bg-surface-card px-3.5 py-2.5"
              >
                <FileText size={16} className="shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 truncate text-sm text-text-body">
                  {file.name}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {showTitleField ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-text-body">
                Title <span className="text-text-faint">(optional)</span>
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Mechanics — chapter 3"
                className="h-11 w-full rounded-control border border-border-default bg-surface-card px-3 text-sm text-text-body placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-text-body">
                Description <span className="text-text-faint">(optional)</span>
              </span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Chapters 3-5 of my class notes"
                className="h-11 w-full rounded-control border border-border-default bg-surface-card px-3 text-sm text-text-body placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1"
              />
            </label>
          </div>
        ) : (
          <p className="text-xs text-text-faint">
            Each file is added as its own library item, named after the file.
          </p>
        )}

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-text-body">
            Or paste the content
          </span>
          <textarea
            value={text}
            rows={5}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste at least a paragraph of study material…"
            className="w-full resize-y rounded-control border border-border-default bg-surface-card px-3 py-2.5 text-sm text-text-body placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1"
          />
          {text.trim().length > 0 && !hasText ? (
            <span className="text-xs text-text-faint">
              {MIN_LIBRARY_TEXT_LENGTH - text.trim().length} more characters
              needed.
            </span>
          ) : null}
        </label>

        <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            Add to library
          </Button>
        </div>
      </form>
    </div>
  );
}
