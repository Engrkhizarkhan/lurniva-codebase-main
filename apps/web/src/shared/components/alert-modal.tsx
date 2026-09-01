import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export interface AlertModalProps {
  open: boolean;
  title?: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function AlertModal({
  open,
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: AlertModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-surface-overlay p-4 animate-[fade-in_150ms_ease-out]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl bg-surface-raised p-6 shadow-lg animate-[fade-up-in_var(--dur-modal)_var(--ease-spring)]"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-error-soft text-error">
          <TriangleAlert size={20} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-text-heading">{title}</h2>
        <p className="mt-1.5 text-sm text-text-muted">{text}</p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body hover:bg-surface-sunken"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-error px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
