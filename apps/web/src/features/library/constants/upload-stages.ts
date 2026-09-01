import {
  CheckCircle2,
  CircleAlert,
  Clock,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UploadStage } from "../types";

export interface UploadStageMeta {
  /** Short chip label — the state at a glance. */
  label: string;
  /** One reassuring line explaining what the system is doing right now. */
  message: string;
  icon: LucideIcon;
  /** Tailwind classes for the status chip. */
  chipClasses: string;
  spin?: boolean;
}

/**
 * Copy for each stage. Every line describes a step that really happens — the
 * upload, the server reading the file, the model distilling it into chapters.
 * Nothing here is a placeholder for work the backend doesn't do.
 */
export const UPLOAD_STAGE_META: Record<UploadStage, UploadStageMeta> = {
  queued: {
    label: "Queued",
    message: "Waiting for the upload ahead of it to finish.",
    icon: Clock,
    chipClasses: "bg-surface-subtle text-text-muted",
  },
  uploading: {
    label: "Uploading",
    message: "Your file is securely uploading.",
    icon: UploadCloud,
    chipClasses: "bg-info-soft text-info",
  },
  uploaded: {
    label: "Uploaded",
    message: "Upload complete. We're reading the document.",
    icon: Loader2,
    chipClasses: "bg-info-soft text-info",
    spin: true,
  },
  processing: {
    label: "Processing",
    message:
      "We're preparing this content for AI study — this may take a moment.",
    icon: Sparkles,
    chipClasses: "bg-warning-soft text-color-amber-600",
    spin: false,
  },
  ready: {
    label: "Ready",
    message: "Your content is ready to use with AI.",
    icon: CheckCircle2,
    chipClasses: "bg-success-soft text-success",
  },
  failed: {
    label: "Failed",
    message: "We couldn't finish this one. You can try again.",
    icon: CircleAlert,
    chipClasses: "bg-error-soft text-error",
  },
};

/** Stages where nothing more will change without the user acting. */
export function isSettled(stage: UploadStage): boolean {
  return stage === "ready" || stage === "failed";
}
