import { resolveOpenAiConfig } from "./openai-client";

/**
 * LLMs the composer's model picker can address. The "default" option always
 * means "use the env-configured MODEL_NAME". Additional models come from the
 * `AI_MODELS` env var (comma-separated ids) so each deployment controls what
 * the platform actually has access to.
 */
export interface AiModelOption {
  id: string;
  label: string;
  description?: string;
}

export function getAvailableModels(): AiModelOption[] {
  const config = resolveOpenAiConfig();
  if (!config) return [];

  const names = (process.env.AI_MODELS ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const defaultName = config.model;
  const options: AiModelOption[] = [
    { id: "default", label: `Default (${defaultName})`, description: "What your environment has configured." },
  ];

  for (const name of names) {
    if (name === defaultName) continue;
    options.push({ id: name, label: name });
  }

  return options;
}

/** Set of model ids the server will actually instantiate — excludes "default". */
export function getAvailableModelIds(): Set<string> {
  return new Set(
    getAvailableModels()
      .map((option) => option.id)
      .filter((id) => id !== "default"),
  );
}