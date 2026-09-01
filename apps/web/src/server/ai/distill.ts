import type { SkillDocLike } from "./grounding";

/** Base URL of the book-to-skill model service (see apps/model). */
export function modelAppUrl(): string {
  return process.env.MODEL_APP_URL ?? "http://localhost:4000";
}

/**
 * Distills raw source text into a structured `SkillDoc` (overview + chapters +
 * glossary + cheatsheet) by POSTing to the model service. Shared by the day
 * content-attach flow and the library so both process material the same way.
 */
export async function distillViaModelApp(
  title: string,
  content: string,
): Promise<SkillDocLike> {
  const response = await fetch(`${modelAppUrl()}/api/model/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Distillation failed (${response.status}): ${text.slice(0, 300)}`);
  }
  const json = (await response.json()) as {
    success?: boolean;
    data?: { skill?: SkillDocLike };
  };
  const skill = json.data?.skill;
  if (!skill || !Array.isArray(skill.chapters)) {
    throw new Error("Distillation returned no usable skill.");
  }
  return skill;
}