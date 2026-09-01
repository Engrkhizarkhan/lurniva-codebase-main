import type { AiDocument, AiResponseStyle } from "~/features/day-study/types";
import type { StructuredReply } from "./ai-provider";
import { markdownToHtml } from "./markdown-to-html";

/**
 * Below this many `##`/`###` headings, an answer reads as prose rather than a
 * document worth opening in the editor.
 */
const MIN_STRUCTURED_HEADING_COUNT = 3;
/** An unstructured answer this long still reads better as a document. */
const LONG_UNSTRUCTURED_CHAR_THRESHOLD = 1500;
const MAX_DERIVED_TITLE_LENGTH = 80;

function countHeadings(markdown: string): number {
  return (markdown.match(/^#{2,3}\s+/gm) ?? []).length;
}

/** The answer's own leading `#`/`##` heading, if it has one worth using. */
function deriveTitle(message: string, fallback: string): string {
  const heading = message.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim();
  return heading && heading.length > 0 && heading.length <= MAX_DERIVED_TITLE_LENGTH
    ? heading
    : fallback;
}

export interface BuildDocumentFieldsInput {
  reply: StructuredReply;
  responseStyle: AiResponseStyle | null | undefined;
  /** Used as the title when the answer has no heading of its own. */
  fallbackTitle: string;
}

export interface DocumentFields {
  isLong: boolean;
  document?: AiDocument;
}

/**
 * Decides whether an answer earns the document-editor treatment, and builds
 * the document when it does. Shared by both response-building services
 * (day-study, AI Study) so "long" means the same thing on both surfaces.
 *
 * An answer counts as long when the student explicitly asked for a detailed
 * guide, or when the answer came out document-shaped (several headings) or
 * simply long, regardless of style — a lengthy summary still reads better as
 * a document than as a chat bubble.
 */
export function buildDocumentFields({
  reply,
  responseStyle,
  fallbackTitle,
}: BuildDocumentFieldsInput): DocumentFields {
  const isLong =
    responseStyle === "detailed_guide" ||
    countHeadings(reply.message) >= MIN_STRUCTURED_HEADING_COUNT ||
    reply.message.trim().length > LONG_UNSTRUCTURED_CHAR_THRESHOLD;

  if (!isLong) return { isLong: false };

  return {
    isLong: true,
    document: {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: deriveTitle(reply.message, fallbackTitle),
      content: markdownToHtml(reply.message),
    },
  };
}
