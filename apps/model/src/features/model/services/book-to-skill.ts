import { getOpenAi } from "../../../server/ai/openai-client";
import type {
  SkillChapter,
  SkillDoc,
  SkillPattern,
  GlossaryEntry,
} from "../types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export interface DistillOptions {
  title?: string;
}

interface ParsedChapter {
  title?: string;
  topics?: string[];
  content?: string;
}

interface ParsedPattern {
  name?: string;
  term?: string;
  title?: string;
  kind?: string;
  description?: string;
  definition?: string;
}

interface ParsedGlossary {
  term?: string;
  definition?: string;
  chapterIds?: string[];
}

interface ParsedSkill {
  overview?: string;
  outline?: string;
  chapters?: ParsedChapter[];
  patterns?: ParsedPattern[];
  glossary?: ParsedGlossary[];
  cheatsheet?: string;
}

function normalizePatternKind(kind: string | undefined): SkillPattern["kind"] {
  const k = (kind ?? "").toLowerCase().replace(/[\s_]/g, "");
  if (k === "principle") return "principle";
  if (k === "technique") return "technique";
  if (k === "antipattern" || k === "anti-pattern") return "anti-pattern";
  return "framework";
}

function parseStructured(raw: string): ParsedSkill | null {
  if (!raw) return null;
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    return JSON.parse(text) as ParsedSkill;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as ParsedSkill;
    } catch {
      return null;
    }
  }
}

/**
 * Distills user/platform content into a structured skill — the book-to-skill
 * methodology. The model turns an overview + on-demand chapters + glossary +
 * patterns + cheatsheet, so study queries can be routed to the right chapter
 * (progressive disclosure) instead of dumping the whole book into context.
 */
export async function distillSkill(
  content: string,
  options: DistillOptions = {},
): Promise<SkillDoc> {
  const ai = getOpenAi();

  if (content.trim().length < 40) {
    throw new Error(
      "Content is too short to structure. Provide at least a paragraph of material.",
    );
  }

  const title = options.title?.trim() || "Untitled study material";

  const system = [
    "You are the book-to-skill structuring engine. You turn a document or body of content into a structured study skill.",
    "Extract STRUCTURE — not a summary. Preserve named frameworks, principles, techniques, and anti-patterns exactly.",
    "Return STRICT JSON only. Do not wrap it in markdown. Shape:",
    JSON.stringify({
      overview: "A 1-2 sentence overview of what this material teaches.",
      outline: "A short sentence describing the scope (optional).",
      chapters: [
        {
          title: "Short chapter title",
          topics: ["keyword-a", "keyword-b"],
          content:
            "Dense, self-contained study notes (~800-3000 chars). Practitioner voice: 'Use X when Y'. Synthesize, never copy raw passages.",
        },
      ],
      patterns: [
        {
          name: "Named framework/principle",
          kind: "framework | principle | technique | anti-pattern",
          description:
            "One sentence: what it is and how to apply (or avoid) it.",
        },
      ],
      glossary: [
        { term: "Term", definition: "Definition used in the material." },
      ],
      cheatsheet:
        "A compact decision table or quick-reference of the most important rules.",
    }),
    "Target 4-9 chapters. Keep each chapter self-contained and actionable.",
  ].join("\n\n");

  const response = await ai.complete(
    [
      { role: "system", content: system },
      {
        role: "user",
        content: `Title: ${title}\n\n---CONTENT---\n${content.slice(0, 40000)}`,
      },
    ],
    { temperature: 0.3, json: true },
  );

  const parsed = parseStructured(response);
  if (!parsed) {
    throw new Error(
      "The model did not return usable JSON. Try again or shorten the input.",
    );
  }

  const chapters: SkillChapter[] = (parsed.chapters ?? []).map(
    (chapter, index) => ({
      id: `ch${String(index + 1).padStart(2, "0")}-${slugify(chapter.title ?? `chapter-${index + 1}`)}`,
      title: chapter.title || `Chapter ${index + 1}`,
      content: chapter.content || "",
      topics: Array.isArray(chapter.topics) ? chapter.topics : [],
    }),
  );

  const patterns: SkillPattern[] = (parsed.patterns ?? []).map((entry) => ({
    name: entry.name ?? entry.term ?? entry.title ?? "Untitled pattern",
    kind: normalizePatternKind(entry.kind),
    description: entry.description ?? entry.definition ?? "",
  }));

  const rawGlossary: GlossaryEntry[] = (parsed.glossary ?? []).map((entry) => ({
    term: entry.term ?? "—",
    definition: entry.definition ?? "",
    chapterIds: Array.isArray(entry.chapterIds) ? entry.chapterIds : [],
  }));

  const glossary: GlossaryEntry[] = rawGlossary.map((entry) => ({
    ...entry,
    chapterIds:
      entry.chapterIds.length > 0
        ? entry.chapterIds
        : chapters
            .filter((chapter) =>
              (chapter.title + " " + chapter.content)
                .toLowerCase()
                .includes(entry.term.toLowerCase()),
            )
            .map((chapter) => chapter.id),
  }));

  return {
    id: randomId("sl"),
    title,
    sourceType: "content",
    overview: parsed.overview || parsed.outline || "",
    chapters,
    patterns,
    glossary,
    cheatsheet: parsed.cheatsheet || "",
    createdAt: new Date().toISOString(),
  };
}
