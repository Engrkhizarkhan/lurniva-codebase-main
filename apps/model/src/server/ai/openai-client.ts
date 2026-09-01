import { isModelConfigured, loadModelEnv } from "../config/env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ModelNotConfiguredError extends Error {
  constructor() {
    super(
      "The model service is not configured. Add OPENAI_API_KEY and MODEL_NAME to your .env file.",
    );
    this.name = "ModelNotConfiguredError";
  }
}

interface ChatCompletionResponse {
  choices: { message: { content: string | null } }[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch-backed OpenAI-compatible chat client (no SDK dependency). Reads
 * OPENAI_API_KEY / MODEL_NAME / OPENAI_BASE_URL from the environment. Works
 * against OpenAI, OpenRouter, a local gateway, or any OpenAI-compatible API.
 */
export class OpenAiClient {
  constructor(
    private env = loadModelEnv(),
    private fetchImpl: typeof fetch = fetch,
  ) {}

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
    };
  }

  async complete(
    messages: ChatMessage[],
    opts: {
      temperature?: number;
      maxTokens?: number;
      json?: boolean;
    } = {},
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.env.MODEL_NAME,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? this.env.MODEL_MAX_TOKENS,
    };
    if (opts.json) {
      body.response_format = { type: "json_object" };
    }

    const res = await this.fetchImpl(
      `${this.env.OPENAI_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OpenAI request failed (${res.status}): ${text.slice(0, 400)}`,
      );
    }

    const data = (await res.json()) as ChatCompletionResponse;
    return data.choices[0]?.message?.content ?? "";
  }

  /** Stream a chat completion, yielding text deltas as they arrive (SSE). */
  async *streamComplete(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number } = {},
  ): AsyncIterable<string> {
    const res = await this.fetchImpl(
      `${this.env.OPENAI_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.env.MODEL_NAME,
          messages,
          temperature: opts.temperature ?? 0.4,
          max_tokens: opts.maxTokens ?? this.env.MODEL_MAX_TOKENS,
          stream: true,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OpenAI stream request failed (${res.status}): ${text.slice(0, 400)}`,
      );
    }

    if (!res.body) {
      throw new Error("OpenAI stream returned no body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const newline = buffer.indexOf("\n");
          if (newline === -1) break;
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") return;
          try {
            const json = JSON.parse(payload) as {
              choices?: { delta?: { content?: string } }[];
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // ignore malformed keep-alive frames
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Keep a single client per process so env is parsed once.
let client: OpenAiClient | null = null;

export function getOpenAi(): OpenAiClient {
  if (!client) {
    if (!isModelConfigured()) {
      throw new ModelNotConfiguredError();
    }
    client = new OpenAiClient(loadModelEnv());
  }
  return client;
}

/** Delay helper reused by tests / fallbacks. */
export { delay };
