import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  AlertTriangle,
  BookOpen,
  Lightbulb,
  ListChecks,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Renders an AI answer as structured, study-friendly reading rather than raw
 * markdown: headings and lists get real vertical rhythm, and a blockquote
 * whose first bold run names a study callout ("Key concept", "Important",
 * "Example", "Remember", "Summary") is promoted into a tinted panel.
 *
 * The callout convention is plain markdown on purpose — the provider prompts
 * ask for `> **Key concept** — ...`, so a model that ignores the instruction
 * still produces a perfectly readable blockquote instead of broken syntax.
 */

interface AiMarkdownProps {
  content: string;
  /** Sidebar sizing: smaller type and tighter spacing. */
  compact?: boolean;
}

interface CalloutMeta {
  label: string;
  icon: LucideIcon;
  /** Accent hue as an `r,g,b` triple the panel tints and rules from. */
  rgb: string;
}

const CALLOUTS: CalloutMeta[] = [
  { label: "Key concept", icon: Lightbulb, rgb: "209,249,65" },
  { label: "Important", icon: AlertTriangle, rgb: "255,113,16" },
  { label: "Example", icon: BookOpen, rgb: "14,124,134" },
  { label: "Remember", icon: Sparkles, rgb: "255,170,57" },
  { label: "Summary", icon: ListChecks, rgb: "28,128,85" },
];

function matchCallout(text: string | null): CalloutMeta | null {
  if (!text) return null;
  const normalized = text.trim().toLowerCase().replace(/[:—–-]+$/, "").trim();
  return (
    CALLOUTS.find((callout) => callout.label.toLowerCase() === normalized) ?? null
  );
}

/** Minimal hast shapes — enough to read the leading `**bold**` of a blockquote. */
interface HastText {
  type: "text";
  value: string;
}
interface HastElement {
  type: "element";
  tagName: string;
  children?: HastNode[];
}
type HastNode = HastText | HastElement | { type: string };

function textOf(node: HastNode): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(textOf).join("");
  }
  return "";
}

/** The text of the first `<strong>` inside a node, if it leads the content. */
function leadingStrongText(node: unknown): string | null {
  const element = node as HastElement | undefined;
  const paragraph = element?.children?.find(
    (child): child is HastElement =>
      "tagName" in child && (child as HastElement).tagName === "p",
  );
  const first = paragraph?.children?.find(
    (child) => !("value" in child) || child.value.trim().length > 0,
  );
  if (!first || !("tagName" in first) || first.tagName !== "strong") return null;
  return textOf(first);
}

/** Answers are always read on a light card, so there is one palette. */
const tokens = {
  heading: "var(--text-heading)",
  body: "var(--text-body)",
  muted: "var(--text-muted)",
  rule: "var(--border-subtle)",
  codeBg: "var(--surface-sunken)",
};

const AiMarkdown = ({ content, compact = false }: AiMarkdownProps) => {
  const base = compact ? 13 : 15.5;

  // Every override closes over `base`/`compact`, so rebuilding the map on each
  // render would remount the whole tree on any parent update.
  const components = useMemo(() => {
    const headingStyle = (size: number, top: number): CSSProperties => ({
      margin: `${top}px 0 6px`,
      fontFamily: "var(--font-display)",
      fontSize: size,
      fontWeight: 700,
      lineHeight: "var(--lh-heading)",
      letterSpacing: "var(--track-heading)",
      color: tokens.heading,
    });

    const listStyle: CSSProperties = {
      margin: "8px 0",
      paddingLeft: 20,
      display: "grid",
      gap: 6,
    };

    function Callout({
      meta,
      children,
    }: {
      meta: CalloutMeta;
      children: ReactNode;
    }) {
      const Glyph = meta.icon;
      return (
        <div
          style={{
            margin: "14px 0",
            padding: compact ? "10px 12px" : "14px 16px",
            borderRadius: "var(--radius-md)",
            background: `rgba(${meta.rgb},.1)`,
            borderLeft: `3px solid rgb(${meta.rgb})`,
            display: "grid",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "var(--track-caps)",
              textTransform: "uppercase",
              color: "var(--text-heading)",
            }}
          >
            <Glyph size={14} />
            {meta.label}
          </span>
          <div style={{ fontSize: base, lineHeight: 1.6, color: tokens.body }}>
            {children}
          </div>
        </div>
      );
    }

    return {
      h1: ({ children }: { children?: ReactNode }) => (
        <h3 style={headingStyle(compact ? 16 : 20, 18)}>{children}</h3>
      ),
      h2: ({ children }: { children?: ReactNode }) => (
        <h4 style={headingStyle(compact ? 15 : 17, 18)}>{children}</h4>
      ),
      h3: ({ children }: { children?: ReactNode }) => (
        <h5 style={headingStyle(compact ? 14 : 15, 14)}>{children}</h5>
      ),
      h4: ({ children }: { children?: ReactNode }) => (
        <h6 style={headingStyle(compact ? 13 : 14, 12)}>{children}</h6>
      ),
      p: ({ children }: { children?: ReactNode }) => (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: base,
            lineHeight: 1.65,
            color: tokens.body,
          }}
        >
          {children}
        </p>
      ),
      ul: ({ children }: { children?: ReactNode }) => (
        <ul style={listStyle}>{children}</ul>
      ),
      ol: ({ children }: { children?: ReactNode }) => (
        <ol style={listStyle}>{children}</ol>
      ),
      li: ({ children }: { children?: ReactNode }) => (
        <li style={{ fontSize: base, lineHeight: 1.6, color: tokens.body }}>
          {children}
        </li>
      ),
      strong: ({ children }: { children?: ReactNode }) => (
        <strong style={{ fontWeight: 700, color: tokens.heading }}>
          {children}
        </strong>
      ),
      em: ({ children }: { children?: ReactNode }) => (
        <em style={{ fontStyle: "italic", color: tokens.body }}>{children}</em>
      ),
      a: ({ children, href }: { children?: ReactNode; href?: string }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: tokens.heading, textDecoration: "underline" }}
        >
          {children}
        </a>
      ),
      code: ({ children }: { children?: ReactNode }) => (
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: base - 1.5,
            background: tokens.codeBg,
            borderRadius: "var(--radius-xs)",
            padding: "1px 5px",
            color: tokens.body,
          }}
        >
          {children}
        </code>
      ),
      pre: ({ children }: { children?: ReactNode }) => (
        <pre
          style={{
            margin: "12px 0",
            padding: 14,
            borderRadius: "var(--radius-md)",
            background: tokens.codeBg,
            overflowX: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: base - 2,
            lineHeight: 1.55,
            color: tokens.body,
          }}
        >
          {children}
        </pre>
      ),
      hr: () => (
        <hr
          style={{
            margin: "18px 0",
            border: 0,
            borderTop: `1px solid ${tokens.rule}`,
          }}
        />
      ),
      table: ({ children }: { children?: ReactNode }) => (
        <div style={{ overflowX: "auto", margin: "12px 0" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: base - 1,
              color: tokens.body,
            }}
          >
            {children}
          </table>
        </div>
      ),
      th: ({ children }: { children?: ReactNode }) => (
        <th
          style={{
            textAlign: "left",
            padding: "8px 10px",
            borderBottom: `1px solid ${tokens.rule}`,
            color: tokens.heading,
            fontWeight: 600,
          }}
        >
          {children}
        </th>
      ),
      td: ({ children }: { children?: ReactNode }) => (
        <td
          style={{
            padding: "8px 10px",
            borderBottom: `1px solid ${tokens.rule}`,
          }}
        >
          {children}
        </td>
      ),
      blockquote: ({ children, node }: { children?: ReactNode; node?: unknown }) => {
        const meta = matchCallout(leadingStrongText(node));
        if (meta) return <Callout meta={meta}>{children}</Callout>;
        return (
          <blockquote
            style={{
              margin: "12px 0",
              padding: "2px 0 2px 14px",
              borderLeft: `3px solid ${tokens.rule}`,
              color: tokens.muted,
              fontSize: base,
              lineHeight: 1.6,
            }}
          >
            {children}
          </blockquote>
        );
      },
    };
  }, [base, compact]);

  return (
    <div style={{ display: "block" }}>
      <Markdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default AiMarkdown;
