import { getOpenAi } from "../../../server/ai/openai-client";
import type { SkillDoc, SkillChapter, QuerySkillInput } from "../types";

export interface QueryResult {
  id: string;
  question: string;
  answer: string;
  keyPoints: string[];
  sources: string[];
  followUps: { id: string; label: string; prompt: string }[];
}

function randomId(): string {
  return `ans_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
}

function scoreChapter(chapter: SkillChapter, query: string): number {
  let score = 0;
  const q = tokenize(query);
  const corpus = tokenize(
    `${chapter.title} ${chapter.topics.join(" ")} ${chapter.content.slice(0, 2000)}`,
  );
  for (const word of q) {
    if (corpus.has(word)) score += 1;
  }
  const title = chapter.title.toLowerCase();
  for (const word of q) {
    if (title.includes(word)) score += 2;
  }
  return score;
}

function pickChapters(
  skill: SkillDoc,
  question: string,
  limit = 2,
): SkillChapter[] {
  const ranked = [...skill.chapters].sort(
    (a, b) => scoreChapter(b, question) - scoreChapter(a, question),
  );
  return ranked
    .slice(0, limit)
    .filter((chapter) => scoreChapter(chapter, question) > 0);
}

function followUp(label: string, prompt: string) {
  return { id: `fu_${Math.random().toString(36).slice(2, 8)}`, label, prompt };
}

function splitAnswer(text: string): {
  answer: string;
  keyPoints: string[];
  sourceLabels: string[];
} {
  const keySection = text.match(
    /#+ Key P:([\s\S]*?)(?=\nSOURCES:|SOURCES:|$)/i,
  );
  const sourcesMatch = text.match(/SOURCES:\s*([\s\S]*)$/i);

  const answer = text
    .replace(/#+ Key P:[\s\S]*?$/i, "")
    .replace(/#+ Key points:[\s\S]*?$/i, "")
    .replace(/SOURCES:\s*[\s\S]*$/i, "")
    .trim();

  const keyPoints = keySection
    ? keySection[1]!
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean)
    : [];

  const sourceLabels = sourcesMatch
    ? sourcesMatch[1]!
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
    : [];

  return { answer, keyPoints: keyPoints.slice(0, 5), sourceLabels };
}

/**
 * Grounded Q&A over a distilled skill. The query is routed to the chapters whose
 * topics best match; those chapters become grounding context, and the model
 * answers from the real content.
 */
export async function querySkill(
  skill: SkillDoc,
  input: QuerySkillInput,
): Promise<QueryResult> {
  const ai = getOpenAi();
  const chapters = pickChapters(skill, input.question, 3);

  const context = chapters
    .map(
      (chapter) =>
        `### ${chapter.title}\nTopics: ${chapter.topics.join(", ")}\n\n${chapter.content}`,
    )
    .join("\n\n");

  const system = [
    "You are a grounded study assistant for a learning platform.",
    "Answer ONLY from the provided chapter context — do not invent facts.",
    "If the context does not cover the question, say so and point to the closest topic.",
    "Keep it concise. End with 'Key points:' each on its own bullet. End with 'SOURCES:' and a comma-separated list of chapter titles you drew from.",
  ].join("\n\n");

  const history = (input.history ?? [])
    .map(
      (entry) =>
        `${entry.role === "user" ? "Student" : "Assistant"}: ${entry.content}`,
    )
    .join("\n");

  const response = await ai.complete(
    [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          `Skill: ${skill.title}`,
          `---CHAPTER CONTEXT---\n${context}`,
          history ? `---EARLIER CONVERSATION---\n${history}` : "",
          `---QUESTION---\n${input.question}`,
        ].join("\n\n"),
      },
    ],
    { temperature: 0.3 },
  );

  const parsed = splitAnswer(response);

  return {
    id: randomId(),
    question: input.question,
    answer: parsed.answer,
    keyPoints: parsed.keyPoints,
    sources: parsed.sourceLabels.length
      ? parsed.sourceLabels
      : chapters.map((chapter) => chapter.title),
    followUps: [
      followUp(
        "Go deeper",
        `Expand on ${chapters[0]?.title ?? "the selected chapter"} with a worked example.`,
      ),
      followUp("Quiz me", `Quiz me on: ${input.question}`),
      followUp(
        "Revision notes",
        "Turn this into revision notes for quick study.",
      ),
    ],
  };
}
