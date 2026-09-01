import type { Flashcard } from "~/features/day-study/types";
import type {
  AiChatParams,
  AiResponseStyle,
  AiLongFormParams,
  AiProvider,
  AiTopicParams,
  ConversationChunk,
  DayTopicContext,
  GeneratedMcq,
  GeneratedShortQuestion,
  GradeShortAnswerParams,
  GradedAnswer,
  StructuredReply,
} from "./ai-provider";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function topicLabels(context: DayTopicContext): string[] {
  const labels = context.topics.map(
    (topic) => topic.subtopicLabel ?? topic.topicLabel,
  );
  return labels.length > 0 ? labels : [context.planName];
}

function pickTopic(context: DayTopicContext, index: number): string {
  const labels = topicLabels(context);
  return labels[index % labels.length]!;
}

async function* streamWords(text: string, delayMs = 18): AsyncIterable<string> {
  const words = text.split(/(\s+)/);
  for (const word of words) {
    if (word.length > 0) {
      yield word;
      if (word.trim().length > 0) await sleep(delayMs);
    }
  }
}

const STYLE_LABEL: Record<AiResponseStyle, string> = {
  summary: "Summary",
  revision_notes: "Revision notes",
  detailed_guide: "Detailed guide",
  last_minute_notes: "Last-minute notes",
};

/**
 * The offline stand-in for a real answer. It deliberately exercises the whole
 * markdown vocabulary the response renderer styles — headings, lists, bold and
 * blockquote callouts — so the study UI can be worked on without an API key.
 */
function buildChatReply(params: AiChatParams): string {
  const topics = topicLabels(params);
  const primary = pickTopic(params, 0);
  const secondary = pickTopic(params, 1);
  const question = params.message.trim();
  const style = params.responseStyle ?? "summary";
  const scope = params.topicPath ?? topics.join(", ");

  if (style === "last_minute_notes") {
    return [
      `## ${STYLE_LABEL[style]}: ${primary}`,
      "",
      ...topics.map((label) => `- **${label}** — the one testable fact to carry into the exam.`),
      "",
      `> **Remember** — if you only re-read one line, make it ${primary}.`,
    ].join("\n");
  }

  if (style === "revision_notes") {
    return [
      `## ${primary}`,
      "",
      `- **Definition** — the core statement of ${primary}, in one sentence.`,
      `- **Why it matters** — it underpins ${secondary} later in ${scope}.`,
      "- **Common mistake** — students state the rule but skip the condition it depends on.",
      "",
      `## Linking to ${secondary}`,
      "",
      `1. State ${primary} precisely.`,
      `2. Apply it to a ${secondary} problem.`,
      "3. Check the result against the condition from step 1.",
      "",
      `> **Key concept** — ${primary} and ${secondary} are the same idea seen from two directions.`,
    ].join("\n");
  }

  if (style === "detailed_guide") {
    return [
      `## Working through "${question}"`,
      "",
      `This sits inside **${scope}**, so start from ${primary} and build outwards.`,
      "",
      "### Step 1 — Establish the idea",
      "",
      `${primary} describes how the pieces of this topic fit together. Get this precise before moving on.`,
      "",
      "### Step 2 — Apply it",
      "",
      `Take a standard ${secondary} problem and apply ${primary} to it line by line.`,
      "",
      `> **Example** — a typical exam question gives you ${secondary} and asks you to recover ${primary}.`,
      "",
      "### Step 3 — Check yourself",
      "",
      "- Can you state the idea without notes?",
      "- Can you spot where it does not apply?",
      "",
      `> **Summary** — ${primary} first, ${secondary} second, and the rest of ${scope} follows.`,
    ].join("\n");
  }

  return [
    `Here is a quick take on **"${question}"** as it relates to **${primary}** (from ${scope}).`,
    "",
    "## The short answer",
    "",
    `Think of it in three parts: what it is, why it matters, and how it connects to the rest of the set. The core idea centres on ${primary}, which links closely with ${secondary}.`,
    "",
    "## What to hold on to",
    "",
    `- ${primary} is the anchor concept here.`,
    `- ${secondary} is the first place you will see it applied.`,
    "- Active recall beats re-reading for both.",
    `- A quick check: \\( a^2 + b^2 = c^2 \\) is the kind of relationship worth memorizing exactly, not approximately.`,
    "",
    `> **Key concept** — once ${primary} clicks, the rest of ${scope} tends to fall into place.`,
  ].join("\n");
}

function buildLongForm(params: AiLongFormParams): string {
  const labels = topicLabels(params);
  const heading = labels.join(" + ");

  if (params.feature === "summarize") {
    return (
      `# Summary: ${heading}\n\n` +
      `Today's study set for **${params.planName}** covers ${labels.length} topic${
        labels.length === 1 ? "" : "s"
      }: ${heading}.\n\n` +
      labels
        .map(
          (label) =>
            `## ${label}\n\n${label} is one of the core ideas for today. At a high level, ` +
            `it builds on prior concepts and sets up what comes next in the plan. Focus on ` +
            `understanding the underlying mechanism rather than memorizing definitions.\n`,
        )
        .join("\n") +
      `\n## Key takeaway\n\nIf you remember one thing from today, make it how ${labels[0]} ` +
      `ties the rest of this set together.\n`
    );
  }

  if (params.feature === "revision_notes") {
    return (
      `# Revision notes: ${heading}\n\n` +
      labels
        .map(
          (label, index) =>
            `## ${index + 1}. ${label}\n\n` +
            `- Core definition and where it fits in the syllabus\n` +
            `- The one worked example most likely to appear in an exam\n` +
            `- A common mistake students make with ${label}\n` +
            `- How ${label} links to ${labels[(index + 1) % labels.length]}\n`,
        )
        .join("\n") +
      `\n## Practice next\n\nRun through the MCQs or short questions for this set to check ` +
      `retention before moving on.\n`
    );
  }

  // last_minute_notes
  return (
    `# Last-minute notes: ${heading}\n\n` +
    `Five-minute recap before you close the book:\n\n` +
    labels.map((label) => `- **${label}** — the one thing to remember, fast.`).join("\n") +
    `\n\n> If you only have time for one pass, re-read the bolded terms above and move on.\n`
  );
}

function buildMcq(context: AiTopicParams, index: number): GeneratedMcq {
  const label = pickTopic(context, index);
  const correctOptionIdx = index % 4;
  const options = Array.from({ length: 4 }, (_, optionIndex) =>
    optionIndex === correctOptionIdx
      ? `The correct description of ${label}`
      : `A plausible but incorrect statement about ${label} (option ${optionIndex + 1})`,
  );
  return {
    question: {
      id: createId("mcq"),
      prompt: `Which statement best describes ${label}?`,
      options,
    },
    correctOptionIdx,
    explanation: `${label} is best described by option ${correctOptionIdx + 1} — the other choices ` +
      `mix in details that don't apply to ${label} specifically.`,
  };
}

function buildShortQuestion(context: AiTopicParams, index: number): GeneratedShortQuestion {
  const label = pickTopic(context, index);
  return {
    question: {
      id: createId("short"),
      prompt: `In 2-3 sentences, explain ${label} and why it matters in ${context.planName}.`,
    },
    modelAnswer:
      `${label} refers to the core idea covered under this topic. It matters because it ` +
      `connects directly to the rest of today's study set and is a common exam focus.`,
  };
}

export class MockAiProvider implements AiProvider {
  async *streamChat(params: AiChatParams): AsyncIterable<string> {
    yield* streamWords(buildChatReply(params));
  }

  async *streamLongForm(params: AiLongFormParams): AsyncIterable<string> {
    yield* streamWords(buildLongForm(params), 8);
  }

  async completeConversation(
    params: AiChatParams,
  ): Promise<StructuredReply> {
    await sleep(400);
    const message = buildChatReply(params);
    const topics = topicLabels(params);
    const styleLabel = STYLE_LABEL[params.responseStyle ?? "summary"];
    return {
      message,
      keyPoints: [
        `Delivered as ${styleLabel.toLowerCase()}.`,
        `Core idea centers on ${topics[0] ?? params.planName}.`,
        `Links closely with ${topics[1] ?? topics[0] ?? "the rest of the set"}.`,
        "Ask a follow-up to go deeper on any part.",
      ],
      followUps: [
        {
          label: "Turn this into study notes",
          prompt: "Turn this into study notes",
        },
        { label: "Quiz me on this", prompt: "Quiz me on this" },
      ],
      sourceLabel: params.topicPath
        ? `From: ${params.topicPath}`
        : topics.length
          ? `From: ${topics.slice(0, 2).join(", ")}`
          : null,
    };
  }

  async *streamConversation(
    params: AiChatParams,
  ): AsyncIterable<ConversationChunk> {
    const reply = await this.completeConversation(params);
    for await (const word of streamWords(reply.message)) {
      yield { kind: "delta", text: word };
    }
    yield { kind: "reply", reply };
  }

  async generateFlashcards(params: AiTopicParams): Promise<Flashcard[]> {
    await sleep(400);
    return Array.from({ length: params.count }, (_, index) => {
      const label = pickTopic(params, index);
      const card: Flashcard = {
        id: createId("card"),
        front: `What is ${label}?`,
        back: `${label} is a key concept in ${params.planName} — the short, testable definition ` +
          `a student should be able to recall without notes.`,
      };
      return card;
    });
  }

  async generateMcqs(params: AiTopicParams): Promise<GeneratedMcq[]> {
    await sleep(400);
    return Array.from({ length: params.count }, (_, index) => buildMcq(params, index));
  }

  async generateShortQuestions(params: AiTopicParams): Promise<GeneratedShortQuestion[]> {
    await sleep(400);
    return Array.from({ length: params.count }, (_, index) => buildShortQuestion(params, index));
  }

  async gradeShortAnswer(params: GradeShortAnswerParams): Promise<GradedAnswer> {
    await sleep(300);
    const modelWords = new Set(
      params.modelAnswer
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3),
    );
    const responseWords = params.responseText
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3);
    const overlap = responseWords.filter((word) => modelWords.has(word)).length;
    const overlapRatio = modelWords.size > 0 ? overlap / modelWords.size : 0;
    const isCorrect = params.responseText.trim().length > 0 && overlapRatio >= 0.2;

    return {
      isCorrect,
      feedback: isCorrect
        ? "Good answer — you covered the key ideas the model answer expects."
        : "Not quite there yet. Compare your answer with the model answer below and note what's missing.",
    };
  }
}
