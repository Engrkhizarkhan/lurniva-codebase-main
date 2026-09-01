import { z } from "zod";

/**
 * Model-service environment. `createEnv` throws a readable error listing every
 * invalid/missing variable, so a misconfigured `.env` fails fast on the server.
 */
const modelEnvSchema = z.object({
  /** OpenAI-compatible API key. Set this in `.env` (or env of the running host). */
  OPENAI_API_KEY: z.string(),
  /** The model to use, e.g. `gpt-4o-mini`, `gpt-4o`, `o3-mini`, or any provider model id. */
  MODEL_NAME: z.string(),
  /** Optional base URL override — lets you point at any OpenAI-compatible gateway. */
  OPENAI_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("https://api.openai.com/v1"),
  /** Optional guard against unbounded generation. */
  MODEL_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
});

export type ModelEnv = z.infer<typeof modelEnvSchema>;

export function loadModelEnv(
  source: Record<string, string | undefined> = process.env,
): ModelEnv {
  const parsed = modelEnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid model environment variables:\n${issues}`);
  }
  return parsed.data;
}

/** Server-side "is the model service actually configured?" — used by the handshake route. */
export function isModelConfigured(
  source: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(source.OPENAI_API_KEY && source.MODEL_NAME);
}
