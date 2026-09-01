import type {
  SkillDoc,
  LearningPlan,
  GeneratedAssessment,
  QuerySkillInput,
} from "../features/model/types";

/** Minimal typed HTTP client for the model app's own REST API. */
class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T }> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json()) as { data: T; error?: { message: string } };
  if (!res.ok || !body.data) {
    throw new ApiError(
      body.error?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return body;
}

export interface Handshake {
  configured: boolean;
  modelName: string | null;
  baseUrl: string;
  message: string;
}

export interface SkillSummary {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  overview: string;
  chapterCount: number;
}

export async function getHandshake(): Promise<Handshake> {
  const { data } = await request<Handshake>("/api/model/handshake");
  return data;
}

export async function listSkills(): Promise<SkillSummary[]> {
  const { data } = await request<{ skills: SkillSummary[] }>(
    "/api/model/skills",
  );
  return data.skills;
}

export async function createSkill(
  title: string | undefined,
  content: string,
): Promise<SkillDoc> {
  const { data } = await request<{ skill: SkillDoc }>("/api/model/skills", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
  return data.skill;
}

export async function getSkill(id: string): Promise<SkillDoc> {
  const { data } = await request<{ skill: SkillDoc }>(
    `/api/model/skills/${id}`,
  );
  return data.skill;
}

export async function querySkill(
  id: string,
  input: QuerySkillInput,
): Promise<QueryResult> {
  const { data } = await request<{ result: QueryResult }>(
    `/api/model/skills/${id}/query`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.result;
}

export interface PlanOptions {
  timeline: "auto" | "manual";
  startDate?: string;
  hoursPerDay?: number;
  daysPerWeek?: number;
  totalDays?: number;
  manualDays?: { title?: string; chapters: string[] }[];
}

export async function buildPlan(
  id: string,
  options: PlanOptions,
): Promise<LearningPlan> {
  const { data } = await request<{ plan: LearningPlan }>(
    `/api/model/skills/${id}/plan`,
    {
      method: "POST",
      body: JSON.stringify(options),
    },
  );
  return data.plan;
}

export interface AssessmentOptions {
  kind: "flashcards" | "mcqs" | "short_questions" | "mock_exam";
  chapterIds?: string[];
  count?: number;
}

export async function generateAssessment(
  id: string,
  options: AssessmentOptions,
): Promise<GeneratedAssessment> {
  const { data } = await request<{ assessment: GeneratedAssessment }>(
    `/api/model/skills/${id}/assessments`,
    { method: "POST", body: JSON.stringify(options) },
  );
  return data.assessment;
}

export interface QueryFollowUp {
  id: string;
  label: string;
  prompt: string;
}

export interface QueryResult {
  id: string;
  question: string;
  answer: string;
  keyPoints: string[];
  sources: string[];
  followUps: {
    id: string;
    label: string;
    prompt: string;
  }[];
}
