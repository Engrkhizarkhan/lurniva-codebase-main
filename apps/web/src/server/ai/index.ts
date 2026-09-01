import { MockAiProvider } from "./mock-provider";
import type { AiProvider } from "./ai-provider";
import { OpenAiClient, resolveOpenAiConfig } from "./openai-client";
import { OpenAiAiProvider } from "./openai-provider";
import { getAvailableModelIds } from "./models";

const providers = new Map<string, AiProvider>();

/**
 * Single place the app asks for an AI backend.
 *
 * - If `OPENAI_API_KEY` + `MODEL_NAME` are configured in the env, it returns a
 *   real, grounded OpenAI-backed provider.
 * - Otherwise it falls back to `MockAiProvider` so the app still runs in dev.
 *
 * Pass an optional `model` to address a specific LLM (composer model picker,
 * per-request). Providers are cached per model id — the "default" id maps to
 * the env-configured `MODEL_NAME`. No other code depends on this seam's
 * internals.
 */
export function getAiProvider(model?: string): AiProvider {
  const id = model && model !== "default" && model.trim() ? model.trim() : "default";
  const cached = providers.get(id);
  if (cached) return cached;

  const config = resolveOpenAiConfig();
  if (!config) {
    const provider = new MockAiProvider();
    providers.set(id, provider);
    return provider;
  }

  const client =
    id !== "default" && getAvailableModelIds().has(id)
      ? new OpenAiClient({ ...config, model: id })
      : new OpenAiClient(config);

  const provider = new OpenAiAiProvider(client);
  providers.set(id, provider);
  return provider;
}

export type * from "./ai-provider";