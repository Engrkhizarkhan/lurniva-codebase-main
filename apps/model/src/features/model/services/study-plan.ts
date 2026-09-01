import { getOpenAi } from "../../../server/ai/openai-client";
import type {
  BuildPlanInput,
  LearningPlan,
  PlanDay,
  SkillChapter,
  SkillDoc,
} from "../types";

const MS_DAY = 86_400_000;

function randomId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function futureDate(start: string, days: number): string {
  const startMs = new Date(start).getTime();
  const base = Number.isNaN(startMs) ? Date.now() : startMs;
  return new Date(base + days * MS_DAY).toISOString().slice(0, 10);
}

/** Auto timeline: spread chapters across `totalDays`, one chunk per day. */
function autoSpread(
  chapters: SkillChapter[],
  totalDays: number,
  hoursPerDay: number,
): PlanDay[] {
  const count = Math.max(1, totalDays);
  const perDay = Math.max(1, Math.ceil(chapters.length / count));
  const days: PlanDay[] = [];

  for (let dayIndex = 0; dayIndex < count; dayIndex++) {
    const slice = chapters.slice(dayIndex * perDay, (dayIndex + 1) * perDay);
    days.push({
      dayNumber: dayIndex + 1,
      title: slice.length
        ? slice.map((c) => c.title).join(" + ")
        : "Recap & practice",
      chapterId: slice[0]?.id ?? null,
      chapters: slice.map((c) => c.id),
      label: `Day ${dayIndex + 1}`,
      durationMinutes: hoursPerDay * 60,
    });
  }
  return days;
}

/** Manual timeline: either explicit days or one chapter per day. */
function manualSpread(
  chapters: SkillChapter[],
  input: BuildPlanInput,
  hoursPerDay: number,
): PlanDay[] {
  const explicit = (input.manualDays ?? []).filter(
    (day) => day.chapters.length,
  );

  if (explicit.length) {
    return explicit.map((day, index) => {
      const matched = day.chapters
        .map((id) => chapters.find((c) => c.id === id || c.title === id))
        .filter((c): c is SkillChapter => Boolean(c));
      return {
        dayNumber: index + 1,
        title: day.title || matched.map((c) => c.title).join(" + "),
        chapterId: matched[0]?.id ?? null,
        chapters: matched.map((c) => c.id),
        label: `Day ${index + 1}`,
        durationMinutes: hoursPerDay * 60,
      };
    });
  }

  return chapters.map((chapter, index) => ({
    dayNumber: index + 1,
    title: chapter.title,
    chapterId: chapter.id,
    chapters: [chapter.id],
    label: `Day ${index + 1}`,
    durationMinutes: hoursPerDay * 60,
  }));
}

/**
 * Builds a study plan from a distilled skill, honouring the user's timeline
 * selection (auto = spread topics across a chosen day count; manual = explicit
 * day-by-day split). Consumed by the model app UI and the platform APIs.
 */
export async function buildStudyPlan(
  skill: SkillDoc,
  input: BuildPlanInput,
): Promise<LearningPlan> {
  const ai = getOpenAi();
  void ai; // model-backed sequencing may be added later; plan sync is deterministic today.

  const hours = Math.max(1, Math.round(input.hoursPerDay ?? 2));
  const daysPerWeek = Math.min(7, input.daysPerWeek ?? 2);
  const chapters = skill.chapters.length ? skill.chapters : [];
  const timeline = input.timeline === "manual" ? "manual" : "auto";

  const days =
    timeline === "manual"
      ? manualSpread(chapters, input, hours)
      : autoSpread(
          chapters,
          Math.max(1, input.totalDays ?? chapters.length),
          hours,
        );

  const startDate = input.startDate || new Date().toISOString().slice(0, 10);

  return {
    id: randomId(),
    skillId: skill.id,
    title: `${skill.title} — study plan`,
    timeline,
    daysPerWeek,
    hoursPerDay: hours,
    totalDays: days.length,
    startDate,
    endDate: futureDate(startDate, days.length),
    days,
  };
}
