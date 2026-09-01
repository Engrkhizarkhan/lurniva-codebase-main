/** OpenAI-compatible client used by the web app's real AI provider.
 *  Config comes from OPENAI_API_KEY / MODEL_NAME (and optional OPENAI_BASE_URL)
 *  in the web app's .env. Returns null-config when the key/model are missing. */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
}

export function resolveOpenAiConfig(
  source: Record<string, string | undefined> = process.env,
): OpenAiConfig | null {
  const apiKey = source.OPENAI_API_KEY ?? "";
  const model = source.MODEL_NAME ?? "";
  if (!apiKey || !model) return null;
  return {
    apiKey,
    model,
    baseUrl: source.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    maxTokens: Number(source.MODEL_MAX_TOKENS ?? 2048),
  };
}

/** Maps UI model ids to a provider request model ("default" → undefined → env model). */
function resolveRequestModel(model?: string): string | undefined {
  const id = model?.trim();
  return id && id !== "default" ? id : undefined;
}

export class OpenAiClient {
  constructor(private config: OpenAiConfig) {}

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  async complete(
    messages: ChatMessage[],
    opts: { json?: boolean; temperature?: number; model?: string } = {},
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model: resolveRequestModel(opts.model) ?? this.config.model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: this.config.maxTokens,
    };
    if (opts.json) body.response_format = { type: "json_object" };

    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `OpenAI request failed (${res.status}): ${text.slice(0, 300)}`,
      );
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }

  async *stream(
    messages: ChatMessage[],
    opts: { json?: boolean; temperature?: number; model?: string } = {},
  ): AsyncIterable<string> {
    const body: Record<string, unknown> = {
      model: resolveRequestModel(opts.model) ?? this.config.model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: this.config.maxTokens,
      stream: true,
    };
    if (opts.json) body.response_format = { type: "json_object" };

    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(
        `OpenAI stream failed (${res.status}): ${text.slice(0, 300)}`,
      );
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
            /* ignore keep-alive frames */
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
