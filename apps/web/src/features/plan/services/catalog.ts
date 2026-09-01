import { prisma } from "@lurniva/db";
import type { CatalogSubjectDto } from "../create-plan-types";

/** Global catalog only (`user_id IS NULL`) — no per-user custom subjects yet. */
export async function getCatalog(): Promise<CatalogSubjectDto[]> {
  const subjects = await prisma.subject.findMany({
    where: { userId: null },
    orderBy: { name: "asc" },
    include: {
      topics: {
        orderBy: { name: "asc" },
        include: {
          subtopics: { orderBy: { name: "asc" } },
        },
      },
    },
  });

  return subjects.map((subject) => ({
    id: subject.id.toString(),
    label: subject.name,
    topics: subject.topics.map((topic) => ({
      id: topic.id.toString(),
      label: topic.name,
      subtopics: topic.subtopics.map((subtopic) => ({
        id: subtopic.id.toString(),
        label: subtopic.name,
      })),
    })),
  }));
}
