import type { Flashcard, LearningFeature } from "~/features/day-study/types";
import type {
  AiChatParams,
  AiResponseStyle,
  AiLongFormParams,
  AiProvider,
  AiTopicParams,
  ConversationChunk,
  GeneratedMcq,
  GeneratedShortQuestion,
  GradeShortAnswerParams,
  GradedAnswer,
  DayTopicContext,
  StructuredReply,
} from "./ai-provider";
import type { OpenAiClient } from "./openai-client";

/** Small helpers for stable JSON parsing from model output. */
function parseJson<T>(raw: string): T | null {
  if (!raw) return null;
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(text) as T;
    return parsed ?? null;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return (JSON.parse(match[0]) as T) ?? null;
    } catch {
      return null;
    }
  }
}

const JSON_ESCAPES: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "\r",
  b: "\b",
  f: "\f",
};

/**
 * Decodes the top-level `"message"` string out of JSON that is still arriving.
 *
 * A structured reply is one JSON object, so a naive stream would show the
 * student nothing until the closing brace. Reading the growing value of that
 * one field lets the answer render token by token while the key points and
 * follow-ups are still being written.
 */
function messageSoFar(raw: string): string {
  const key = raw.indexOf('"message"');
  if (key === -1) return "";
  const colon = raw.indexOf(":", key + '"message"'.length);
  if (colon === -1) return "";
  const open = raw.indexOf('"', colon + 1);
  if (open === -1) return "";

  let out = "";
  for (let index = open + 1; index < raw.length; index += 1) {
    const char = raw[index]!;
    if (char === '"') break;
    if (char !== "\\") {
      out += char;
      continue;
    }
    const escape = raw[index + 1];
    // An escape split across two chunks — stop and pick it up next time.
    if (escape === undefined) break;
    index += 1;
    if (escape === "u") {
      const hex = raw.slice(index + 1, index + 5);
      const code = Number.parseInt(hex, 16);
      if (hex.length < 4 || Number.isNaN(code)) break;
      out += String.fromCharCode(code);
      index += 4;
      continue;
    }
    out += JSON_ESCAPES[escape] ?? escape;
  }
  return out;
}

function topicLabels(context: DayTopicContext): string[] {
  const labels = context.topics.map(
    (topic) => topic.subtopicLabel ?? topic.topicLabel,
  );
  return labels.length > 0 ? labels : [context.planName];
}

function chaptersBlock(context: DayTopicContext): string {
  if (!context.chapters?.length) return "";
  return (
    "\n\n---SOURCE MATERIAL (answer from this when it covers the question)---\n" +
    context.chapters
      .map(
        (chapter) =>
          `### ${chapter.title}\nTopics: ${chapter.topics.join(", ")}\n\n${chapter.content}`,
      )
      .join("\n\n")
  );
}

function contextFor(context: DayTopicContext): string {
  return (
    `Study set: ${context.planName}\nTopics: ${topicLabels(context).join(", ")}` +
    (context.topicPath ? `\nCurrently studying: ${context.topicPath}` : "") +
    chaptersBlock(context)
  );
}

function longFormSystem(feature: LearningFeature): string {
  switch (feature) {
    case "summarize":
      return "Write a clear study summary of the day's topics in markdown. Structuring headings, focus on mechanisms over trivia.";
    case "revision_notes":
      return "Write dense revision notes in markdown: definitions, worked example cues, common mistakes, and links between the topics.";
    default:
      return "Write very short last-minute study notes in markdown: the single most testable memory for each topic, fast.";
  }
}

/**
 * The student-chosen delivery format. Shapes the answer's structure; the tone
 * (`modeInstruction`) is orthogonal and still applies.
 */
function responseStyleInstruction(style: AiResponseStyle | undefined): string {
  switch (style) {
    case "revision_notes":
      return "Format: revision notes. Group the answer under short `##` headings, then dense bullet points — definitions, formulas, worked-example cues, common mistakes. Skip prose paragraphs.";
    case "detailed_guide":
      return "Format: a detailed guide. Work through the idea step by step under `##` headings, with a worked example and the reasoning behind each step. Depth over brevity.";
    case "last_minute_notes":
      return "Format: last-minute revision notes. Only the most testable facts, as a tight bullet list. No preamble, no recap, nothing optional.";
    default:
      return "Format: a short summary. Lead with the answer in two or three sentences, then a small bullet list of the essentials.";
  }
}

/**
 * The markdown vocabulary the response renderer styles. Callouts are ordinary
 * blockquotes whose first bold run names the kind, so a plain markdown client
 * still renders them sensibly.
 */
const MARKDOWN_HOUSE_STYLE = [
  "Write the answer as study-friendly markdown, never a wall of text:",
  "- `##`/`###` headings to break up anything longer than a few sentences.",
  "- Bullet lists for parallel facts, numbered lists for ordered steps.",
  "- `**bold**` on terms the student must remember; fenced code blocks for code.",
  "- For math, use LaTeX: `\\( ... \\)` for inline expressions, `$$ ... $$` on its own line for standalone equations. Matrix/array notation (e.g. `\\begin{pmatrix} ... \\end{pmatrix}`) is fine when it's the clearest way to show it.",
  "- For emphasis use a blockquote callout whose first run names its kind, e.g. `> **Key concept** — ...`. Allowed kinds: Key concept, Important, Example, Remember, Summary.",
  "- At most two callouts per answer, and only when they genuinely earn the space.",
].join("\n");

function modeInstruction(mode: AiChatParams["mode"]): string {
  switch (mode) {
    case "exploratory":
      return "Tone: open and exploratory — invite the student to think further and connect ideas.";
    case "concise":
      return "Tone: very concise — tight, scannable answer with no padding.";
    default:
      return "Tone: a patient, guided tutor — walk through the idea clearly and check understanding.";
  }
}

/** A real OpenAI-backed AiProvider. It reads OPENAI_API_KEY / MODEL_NAME from
 *  the web app env; `getAiProvider()` falls back to the mock when unset. */
export class OpenAiAiProvider implements AiProvider {
  constructor(private client: OpenAiClient) {}

  async *streamChat(params: AiChatParams): AsyncIterable<string> {
    const system = [
      "You are a grounding study assistant on a learning platform.",
      contextFor(params),
      params.chapters?.length
        ? "Answer ONLY from the provided SOURCE MATERIAL — do not invent facts. If the material does not cover the question, say so and point to the closest topic."
        : "Answer the student from the day's topics. Be concise and correct. If asked something outside the topics, say so.",
      modeInstruction(params.mode),
      responseStyleInstruction(params.responseStyle),
      MARKDOWN_HOUSE_STYLE,
      "Keep it study-focused.",
    ].join("\n\n");
    yield* this.client.stream(
      [
        { role: "system", content: system },
        ...params.history.map((entry) => ({
          role: entry.role as "user" | "assistant",
          content: entry.content,
        })),
        { role: "user", content: params.message },
      ],
      { temperature: 0.4, model: params.model },
    );
  }

  async *streamLongForm(params: AiLongFormParams): AsyncIterable<string> {
    const system = [longFormSystem(params.feature), contextFor(params)].join(
      "\n\n",
    );
    yield* this.client.stream(
      [
        { role: "system", content: system },
        {
          role: "user",
          content: `Produce ${params.feature.replaceAll("_", " ")} for today's study set.`,
        },
      ],
      { temperature: 0.4, model: params.model },
    );
  }

  /** The prompt and messages both conversation calls send — one contract. */
  private conversationRequest(params: AiChatParams) {
    const system = [
      "You are a grounding study assistant on a learning platform.",
      contextFor(params),
      params.chapters?.length
        ? "Answer ONLY from the provided SOURCE MATERIAL — do not invent facts. If the material does not cover the question, say so and point to the closest topic."
        : "Answer the student from the day's topics. Be concise and correct. If asked something outside the topics, say so.",
      modeInstruction(params.mode),
      responseStyleInstruction(params.responseStyle),
      MARKDOWN_HOUSE_STYLE,
      "Return STRICT JSON only, with `message` FIRST so it can be streamed. The `message` value is markdown following the house style above:",
      '{"message":"the answer as study-friendly markdown","key_points":["3-4 bullet highlights"],"follow_ups":[{"label":"One-tap button text","prompt":"the full prompt phrase"}],"sources":["Comma-separated chapter names or topic labels drawn from"]}',
    ].join("\n\n");

    return [
      { role: "system" as const, content: system },
      ...params.history.map((entry) => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
      })),
      { role: "user" as const, content: params.message },
    ];
  }

  /** Turns the model's JSON envelope into the reply the chat UI renders. */
  private toStructuredReply(raw: string): StructuredReply {
    const data = parseJson<{
      message?: string;
      key_points?: string[];
      follow_ups?: { label?: string; prompt?: string }[];
      sources?: string[];
    }>(raw);

    const sourceLabel =
      (data?.sources ?? []).filter(Boolean).length > 0
        ? `From: ${data!.sources!.join(", ")}`
        : null;

    return {
      // A cut-off stream still has readable text inside the open string.
      message:
        data?.message ??
        (messageSoFar(raw) ||
          "I couldn't compose a reply just now. Try rephrasing your question."),
      keyPoints: (data?.key_points ?? []).slice(0, 5),
      followUps: (data?.follow_ups ?? []).slice(0, 3).map((followUp, index) => ({
        label: followUp.label ?? `Follow-up ${index + 1}`,
        prompt: followUp.prompt ?? followUp.label ?? "",
      })),
      sourceLabel,
    };
  }

  async completeConversation(params: AiChatParams): Promise<StructuredReply> {
    const raw = await this.client.complete(this.conversationRequest(params), {
      json: true,
      temperature: 0.3,
      model: params.model,
    });
    return this.toStructuredReply(raw);
  }

  async *streamConversation(
    params: AiChatParams,
  ): AsyncIterable<ConversationChunk> {
    let raw = "";
    let sent = 0;

    for await (const chunk of this.client.stream(
      this.conversationRequest(params),
      { json: true, temperature: 0.3, model: params.model },
    )) {
      raw += chunk;
      const text = messageSoFar(raw);
      if (text.length > sent) {
        yield { kind: "delta", text: text.slice(sent) };
        sent = text.length;
      }
    }

    yield { kind: "reply", reply: this.toStructuredReply(raw) };
  }

  async generateFlashcards(params: AiTopicParams): Promise<Flashcard[]> {
    const system = [
      `Generate ${params.count} study flashcards for these topics.`,
      'Return STRICT JSON: {"cards":[{"front":"...","back":"..."}]}',
    ].join("\n\n");
    const raw = await this.client.complete(
      [
        { role: "system", content: system },
        { role: "user", content: contextFor(params) },
      ],
      { json: true, temperature: 0.6, model: params.model },
    );
    const data = parseJson<{ cards?: { front?: string; back?: string }[] }>(
      raw,
    );
    return (data?.cards ?? []).map((card, index) => ({
      id: `card_${Date.now()}_${index}`,
      front: card.front ?? "",
      back: card.back ?? "",
    }));
  }

  async generateMcqs(params: AiTopicParams): Promise<GeneratedMcq[]> {
    const system = [
      `Generate ${params.count} multiple-choice questions for these topics.`,
      'Return STRICT JSON: {"questions":[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}',
    ].join("\n\n");
    const raw = await this.client.complete(
      [
        { role: "system", content: system },
        { role: "user", content: contextFor(params) },
      ],
      { json: true, temperature: 0.6, model: params.model },
    );
    const data = parseJson<{
      questions?: {
        prompt?: string;
        options?: string[];
        correctIndex?: number;
        explanation?: string;
      }[];
    }>(raw);
    return (data?.questions ?? []).flatMap((q, index) => {
      if (!q.prompt || !q.options || q.options.length < 2) return [];
      const correctOptionIdx =
        typeof q.correctIndex === "number" ? q.correctIndex : 0;
      return [
        {
          question: {
            id: `mcq_${Date.now()}_${index}`,
            prompt: q.prompt,
            options: q.options,
          },
          correctOptionIdx,
          explanation: q.explanation ?? "",
        },
      ];
    });
  }

  async generateShortQuestions(
    params: AiTopicParams,
  ): Promise<GeneratedShortQuestion[]> {
    const system = [
      `Generate ${params.count} short-answer questions for these topics.`,
      'Return STRICT JSON: {"questions":[{"prompt":"...","modelAnswer":"..."}]}',
    ].join("\n\n");
    const raw = await this.client.complete(
      [
        { role: "system", content: system },
        { role: "user", content: contextFor(params) },
      ],
      { json: true, temperature: 0.6, model: params.model },
    );
    const data = parseJson<{
      questions?: { prompt?: string; modelAnswer?: string }[];
    }>(raw);
    return (data?.questions ?? []).map((q, index) => ({
      question: {
        id: `short_${Date.now()}_${index}`,
        prompt: q.prompt ?? "",
      },
      modelAnswer: q.modelAnswer ?? "",
    }));
  }

  async gradeShortAnswer(
    params: GradeShortAnswerParams,
  ): Promise<GradedAnswer> {
    const raw = await this.client.complete(
      [
        {
          role: "system",
          content:
            'Grade a student\'s short answer against the model answer. Return STRICT JSON: {"isCorrect":true,"feedback":"..."}',
        },
        {
          role: "user",
          content: `Prompt: ${params.prompt}\n\nModel answer: ${params.modelAnswer}\n\nStudent answer: ${params.responseText}`,
        },
      ],
      { json: true, temperature: 0.2 },
    );
    const data = parseJson<{ isCorrect?: boolean; feedback?: string }>(raw);
    return {
      isCorrect: data?.isCorrect ?? false,
      feedback:
        data?.feedback ??
        "No feedback returned. Compare your answer with the model answer below and revise the parts you missed.",
    };
  }
}

export function learningFeatureLabel(feature: LearningFeature): string {
  return feature.replaceAll("_", " ");
}
