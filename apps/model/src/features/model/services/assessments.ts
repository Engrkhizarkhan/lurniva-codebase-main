import { getOpenAi } from "../../../server/ai/openai-client";
import type {
  AssessmentKind,
  AssessmentQuestion,
  GeneratedAssessment,
  SkillDoc,
} from "../types";

interface MockSectionEntry {
  title?: unknown;
  questions?: unknown;
}

interface MockEntry {
  prompt?: unknown;
  options?: unknown;
  correctIndex?: unknown;
}

export interface GenerateAssessmentInput {
  kind: AssessmentKind;
  chapterIds: string[];
  count?: number;
}

function randomId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface KindSpec {
  name: string;
  shape: string;
  instruction: string;
}

function getSpec(kind: AssessmentKind): KindSpec {
  switch (kind) {
    case "flashcards":
      return {
        name: "flashcards",
        shape: JSON.stringify({
          cards: [{ front: "prompt", back: "concise answer" }],
        }),
        instruction:
          "spaced-repetition cards: a prompt on the front, a concise answer on the back. Return { cards: [...] }.",
      };
    case "mcqs":
      return {
        name: "multiple-choice questions",
        shape: JSON.stringify({
          questions: [
            { prompt: "...", options: ["A", "B", "C", "D"], correctIndex: 0 },
          ],
        }),
        instruction:
          "single-answer MCQs with 4 options and the correct index. Return { questions: [...] }.",
      };
    case "short_questions":
      return {
        name: "short-answer questions",
        shape: JSON.stringify({
          questions: [
            { prompt: "...", modelAnswer: "a strong answer covers..." },
          ],
        }),
        instruction:
          "short-answer questions with a model answer. Return { questions: [...] }.",
      };
    case "mock_exam":
      return {
        name: "a mock exam",
        shape: JSON.stringify({
          sections: [
            {
              title: "Section A",
              questions: [
                {
                  prompt: "...",
                  options: ["A", "B", "C", "D"],
                  correctIndex: 0,
                  marks: 1,
                },
              ],
            },
          ],
        }),
        instruction:
          "a mock exam organised into MCQ sections, each with marks. Return { sections: [...] }.",
      };
  }
}

function stringv(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeOptions(value: unknown): string[] | undefined {
  if (Array.isArray(value) && value.length) {
    return value.map(String);
  }
  return undefined;
}

function extractQuestions(
  raw: string,
  kind: AssessmentKind,
): AssessmentQuestion[] {
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  let data: Record<string, unknown> | null = null;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        data = JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        return [];
      }
    }
  }
  if (!data) return [];

  if (kind === "flashcards") {
    const cards = Array.isArray(data.cards)
      ? (data.cards as Record<string, unknown>[])
      : [];
    return cards.map((card, index) => ({
      id: `flashcard_${index}`,
      kind,
      prompt: stringv(card.front, `Flashcard ${index + 1}`),
      modelAnswer: stringv(card.back ?? card.answer, ""),
    }));
  }

  if (kind === "short_questions") {
    const questions = Array.isArray(data.questions)
      ? (data.questions as Record<string, unknown>[])
      : [];
    return questions.map((q, index) => ({
      id: `short_${index}`,
      kind,
      prompt: stringv(q.prompt, `Short question ${index + 1}`),
      modelAnswer: stringv(q.modelAnswer, ""),
    }));
  }

  if (kind === "mcqs") {
    const questions = Array.isArray(data.questions)
      ? (data.questions as Record<string, unknown>[])
      : [];
    return questions.map((q, index) => ({
      id: `mcq_${index}`,
      kind,
      prompt: stringv(q.prompt, `MCQ ${index + 1}`),
      options: normalizeOptions(q.options),
      correctIndex:
        typeof q.correctIndex === "number" ? q.correctIndex : undefined,
    }));
  }

  const sections = Array.isArray(data.sections)
    ? (data.sections as MockSectionEntry[])
    : [];
  const flat: AssessmentQuestion[] = [];
  for (const section of sections) {
    const title = stringv(section.title, "");
    const items = Array.isArray(section.questions)
      ? (section.questions as MockEntry[])
      : [];
    items.forEach((q, index) => {
      flat.push({
        id: `mock_${flat.length}`,
        kind: "mock_exam",
        prompt: `${title ? `[${title}] ` : ""}${stringv(q.prompt, `Exam question ${index + 1}`)}`,
        options: normalizeOptions(q.options),
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      });
    });
  }
  return flat;
}

/**
 * Generates an assessment (flashcards / MCQs / short questions / mock exam)
 * from the selected chapters of a distilled skill, using the model. The client
 * receives a shielded payload (no answer key) for mcq/mock flashcards get the
 * answer in a separate card you flip.
 */
export async function generateAssessment(
  skill: SkillDoc,
  input: GenerateAssessmentInput,
): Promise<GeneratedAssessment> {
  const ai = getOpenAi();
  const chapters = skill.chapters.filter((chapter) =>
    input.chapterIds.includes(chapter.id),
  );
  const finalChapters =
    chapters.length > 0 ? chapters : skill.chapters.slice(0, 2);

  if (!finalChapters.length) {
    throw new Error("This skill has no chapters to assess.");
  }

  const spec = getSpec(input.kind);
  const targetCount = Math.max(1, input.count ?? 5);

  const context = finalChapters
    .map((chapter) => `### ${chapter.title}\n${chapter.content}`)
    .join("\n\n");

  const response = await ai.complete(
    [
      {
        role: "system",
        content: [
          `You create ${spec.name} from study material for a learning platform.`,
          `Return STRICT JSON, no markdown. Shape: ${spec.shape}`,
          spec.instruction,
          `Produce around ${targetCount} items. Ground everything in the provided chapters only.`,
        ].join("\n\n"),
      },
      {
        role: "user",
        content: `Skill: ${skill.title}\n\n---CHAPTERS---\n${context}`,
      },
    ],
    { temperature: 0.6, json: true },
  );
  console.log("ai response for assessment", response);
  const questions = extractQuestions(response, input.kind);
  if (!questions.length) {
    throw new Error("The model did not return usable questions. Try again.");
  }

  return {
    id: randomId(),
    skillId: skill.id,
    kind: input.kind,
    chapters: finalChapters.map((chapter) => chapter.id),
    questions,
    explanation: "",
  };
}
