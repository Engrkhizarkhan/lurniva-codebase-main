import { BookOpenCheck, Clock3, FileText, NotebookPen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AiResponseStyle } from "../types";
import type { FeatureTone } from "./features";

/**
 * How the student wants answers delivered. The selector and the header chip
 * both read from this list; the id is what the API receives, so adding a style
 * means adding it here, to `AiResponseStyle`, and to the provider's
 * `responseStyleInstruction`.
 */
export interface ResponseStyleMeta {
  id: AiResponseStyle;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: FeatureTone;
}

export const RESPONSE_STYLES: ResponseStyleMeta[] = [
  {
    id: "summary",
    label: "Summary",
    description: "The answer first, then the essentials",
    icon: FileText,
    tone: "info",
  },
  {
    id: "revision_notes",
    label: "Revision notes",
    description: "Headed sections and dense bullets",
    icon: NotebookPen,
    tone: "primary",
  },
  {
    id: "detailed_guide",
    label: "Detailed guide",
    description: "Step by step, with worked reasoning",
    icon: BookOpenCheck,
    tone: "success",
  },
  {
    id: "last_minute_notes",
    label: "Last-minute revision",
    description: "Only what is most testable",
    icon: Clock3,
    tone: "warning",
  },
];

export const RESPONSE_STYLE_BY_ID: Record<AiResponseStyle, ResponseStyleMeta> =
  Object.fromEntries(RESPONSE_STYLES.map((style) => [style.id, style])) as Record<
    AiResponseStyle,
    ResponseStyleMeta
  >;
