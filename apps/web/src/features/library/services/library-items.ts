import { prisma, type Prisma } from "@lurniva/db";
import type { Paginated } from "@lurniva/types";
import type {
  LibraryScope,
  LibraryStatus,
  ListLibraryQuery,
} from "@lurniva/validation";
import { getCatalog } from "../../plan/services/catalog";
import type { CatalogSubjectDto } from "../../plan/create-plan-types";
import { distillViaModelApp } from "~/server/ai/distill";
import type { SkillDocLike } from "~/server/ai/grounding";

/**
 * Reusable study material. Lurniva items are platform-provided (`userId IS
 * NULL`), built deterministically from the subject catalog — the chat/plan
 * can use them with no model call. Personal items are user uploads (pasted
 * text or PDF/Word/txt files) distilled into a structured `SkillDoc` by the
 * model service. Items carry a processing status so a plan can select
 * material before it is ready and "process now" on selection.
 */

// Scope/status are the same closed sets the API validates against, so they're
// owned by `@lurniva/validation` and re-exported here for existing importers.
export type { LibraryScope, LibraryStatus };

export interface LibraryChapterSummary {
  id: string;
  title: string;
  topics: string[];
}

export interface LibraryItemDto {
  id: string;
  title: string;
  scope: LibraryScope;
  status: LibraryStatus;
  sourceType: string;
  fileName?: string;
  description?: string;
  overview?: string;
  chapterCount: number;
  chapters: LibraryChapterSummary[];
  error?: string;
  updatedAt: string;
}

export class LibraryItemNotFoundError extends Error {
  constructor() {
    super("Library item not found");
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Deterministic, offline "platform textbook" built from the subject catalog. */
function catalogSkill(subject: CatalogSubjectDto): {
  sourceText: string;
  skill: SkillDocLike;
} {
  const chapters = subject.topics.map((topic, index) => {
    const subtopics = topic.subtopics.map((subtopic) => subtopic.label);
    const focus = subtopics.length
      ? `Focus areas: ${subtopics.join(", ")}.`
      : "This is a core topic within the subject.";
    return {
      id: `ch${String(index + 1).padStart(2, "0")}-${slugify(topic.label) || "topic"}`,
      title: topic.label,
      topics: subtopics.length ? subtopics : [topic.label],
      content: `## ${topic.label}\n\n${focus}\n\nStudy the definitions, worked examples and common exam questions on ${topic.label}. Link it to the other topics in ${subject.label} and practise active recall.`,
    };
  });

  return {
    sourceText:
      subject.topics
        .flatMap((topic) => [
          topic.label,
          ...topic.subtopics.map((s) => s.label),
        ])
        .join(". ") + ".",
    skill: {
      id: `lib-catalog-${subject.id}`,
      title: subject.label,
      sourceType: "catalog",
      overview: `${subject.label} — ${chapters.length} platform topic${chapters.length === 1 ? "" : "s"} (${chapters
        .slice(0, 3)
        .map((chapter) => chapter.title)
        .join(", ")}${chapters.length > 3 ? "…" : ""}).`,
      chapters,
    },
  };
}

function toDto(
  item: Prisma.LibraryItemGetPayload<Record<string, never>>,
): LibraryItemDto {
  const skill = item.skill as SkillDocLike | null;
  const chapters = Array.isArray(skill?.chapters) ? skill.chapters : [];
  return {
    id: item.id.toString(),
    title: item.title,
    scope: (item.scope as LibraryScope) ?? "personal",
    status: (item.status as LibraryStatus) ?? "raw",
    sourceType: item.sourceType,
    fileName: item.fileName ?? undefined,
    description: item.description ?? undefined,
    overview: skill?.overview ?? undefined,
    chapterCount: chapters.length,
    chapters: chapters.map((chapter) => ({
      id: chapter.id ?? chapter.title,
      title: chapter.title,
      topics: Array.isArray(chapter.topics) ? chapter.topics : [],
    })),
    error: item.error ?? undefined,
    updatedAt: item.updatedAt.toISOString(),
  };
}

/** Seeds platform (Lurniva) items from the subject catalog — idempotent. */
async function ensureLurnivaItems(): Promise<void> {
  const existing = await prisma.libraryItem.count({
    where: { scope: "lurniva" },
  });
  if (existing > 0) return;
  const catalog = await getCatalog();
  if (catalog.length === 0) return;
  await prisma.$transaction(
    catalog.map((subject) => {
      const { sourceText, skill } = catalogSkill(subject);
      return prisma.libraryItem.create({
        data: {
          userId: null,
          scope: "lurniva",
          title: subject.label,
          description: "Platform outline for this subject.",
          status: "ready",
          sourceType: "catalog",
          sourceText,
          skill: skill as unknown as Prisma.InputJsonValue,
        },
      });
    }),
  );
}

function asBigInt(id: string): bigint | null {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

async function findScopedItem(userId: string, itemId: string) {
  const id = asBigInt(itemId);
  const item = id
    ? await prisma.libraryItem.findFirst({
        where: { id, OR: [{ userId }, { userId: null }] },
      })
    : null;
  if (!item) throw new LibraryItemNotFoundError();
  return item;
}

/** Everything visible to the user, unpaged — used where the whole set is needed
 * at once (the plan wizard's content picker, AI study source selection). */
export async function listLibraryItems(
  userId: string,
): Promise<LibraryItemDto[]> {
  await ensureLurnivaItems();
  const items = await prisma.libraryItem.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ scope: "asc" }, { updatedAt: "desc" }],
  });
  return items.map(toDto);
}

/**
 * One page of the user's library, filtered by tab (`scope`), status and free
 * text. Ordered by `(updatedAt desc, id desc)` so the offset boundary stays
 * stable while paging — `updatedAt` alone can tie between seeded rows.
 */
export async function listLibraryItemsPage(
  userId: string,
  query: ListLibraryQuery,
): Promise<Paginated<LibraryItemDto>> {
  await ensureLurnivaItems();

  const where: Prisma.LibraryItemWhereInput = {
    OR: [{ userId }, { userId: null }],
  };
  if (query.scope) where.scope = query.scope;
  if (query.status) where.status = query.status;
  if (query.q) {
    where.AND = [
      {
        OR: [
          { title: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
          { fileName: { contains: query.q, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.libraryItem.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: query.offset,
      take: query.limit,
    }),
    prisma.libraryItem.count({ where }),
  ]);

  return {
    items: items.map(toDto),
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: query.offset + items.length < total,
  };
}

export interface CreateLibraryItemInput {
  title?: string;
  description?: string;
  sourceType: string;
  fileName?: string;
  text: string;
}

/**
 * Distils an item's source text into chapters and writes the outcome back.
 * Deliberately *not* awaited by the request handlers: distillation is a model
 * call that can take a while, and the client needs the row back the moment it
 * exists so it can show a real "processing" state rather than a hung request.
 * The web app runs as a long-lived Node server, so work started here outlives
 * the response. Never throws — every path ends in `ready` or `failed`.
 */
async function distillLibraryItem(
  id: bigint,
  title: string,
  sourceText: string,
): Promise<void> {
  try {
    const skill = await distillViaModelApp(title, sourceText);
    await prisma.libraryItem.update({
      where: { id },
      data: {
        status: "ready",
        error: null,
        skill: skill as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed.";
    await prisma.libraryItem
      .update({ where: { id }, data: { status: "failed", error: message } })
      .catch(() => undefined);
  }
}

/**
 * Stores the uploaded material and hands the row straight back as
 * `processing`. The caller polls the item (or the list) to see it settle to
 * `ready`/`failed` — so the UI can separate "your upload arrived" from "we've
 * finished preparing it".
 */
export async function createLibraryItem(
  userId: string,
  input: CreateLibraryItemInput,
): Promise<LibraryItemDto> {
  const title = input.title?.trim() || input.fileName || "Untitled material";
  const sourceText = input.text.slice(0, 200_000);
  const created = await prisma.libraryItem.create({
    data: {
      userId,
      scope: "personal",
      title,
      description: input.description?.trim() || null,
      status: "processing",
      sourceType: input.sourceType,
      fileName: input.fileName || null,
      sourceText,
    },
  });

  void distillLibraryItem(created.id, title, sourceText);
  return toDto(created);
}

/** Processes a raw/failed item on demand (e.g. when selected in plan stages). */
export async function processLibraryItem(
  userId: string,
  itemId: string,
): Promise<LibraryItemDto> {
  const item = await findScopedItem(userId, itemId);
  if (item.status === "ready") return toDto(item);

  // Lurniva seeds are built offline from the catalog; rebuild rather than call
  // the model service so platform items stay free and deterministic.
  if (item.scope === "lurniva") {
    const catalog = await getCatalog();
    const subject = catalog.find((entry) => entry.label === item.title);
    if (!subject) {
      const failed = await prisma.libraryItem.update({
        where: { id: item.id },
        data: {
          status: "failed",
          error: "Platform item is missing its outline.",
        },
      });
      return toDto(failed);
    }
    const { sourceText, skill } = catalogSkill(subject);
    const processed = await prisma.libraryItem.update({
      where: { id: item.id },
      data: {
        status: "ready",
        error: null,
        sourceText,
        skill: skill as unknown as Prisma.InputJsonValue,
      },
    });
    return toDto(processed);
  }

  // Same contract as an upload: flip to `processing`, hand the row back, and
  // let the model call settle it in the background. Retrying a failed item
  // therefore behaves identically to uploading it in the first place.
  const queued = await prisma.libraryItem.update({
    where: { id: item.id },
    data: { status: "processing", error: null },
  });

  void distillLibraryItem(item.id, item.title, item.sourceText ?? item.title);
  return toDto(queued);
}

export async function getLibraryItem(
  userId: string,
  itemId: string,
): Promise<LibraryItemDto> {
  const item = await findScopedItem(userId, itemId);
  return toDto(item);
}

/** Deletes the user's own personal item. Returns whether anything was removed. */
export async function deleteLibraryItem(
  userId: string,
  itemId: string,
): Promise<boolean> {
  const id = asBigInt(itemId);
  if (!id) return false;
  const result = await prisma.libraryItem.deleteMany({
    where: { id, userId, scope: "personal" },
  });
  return result.count > 0;
}

/** Library item ids picked on a study plan (from its stored draft snapshot). */
export function readLibraryItemIds(
  draftSnapshot: Prisma.JsonValue | null | undefined,
): bigint[] {
  if (!draftSnapshot || typeof draftSnapshot !== "object") return [];
  const snapshot = draftSnapshot as {
    content?: { libraryItemIds?: unknown };
  };
  const raw = snapshot.content?.libraryItemIds;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((value) => (typeof value === "string" ? asBigInt(value) : null))
    .filter((id): id is bigint => id !== null);
}

/** Ready, distilled skills backing the library items a plan selected. */
export async function loadPlanLibrarySkills(
  userId: string,
  draftSnapshot: Prisma.JsonValue | null | undefined,
): Promise<SkillDocLike[]> {
  const ids = readLibraryItemIds(draftSnapshot);
  if (ids.length === 0) return [];
  const items = await prisma.libraryItem.findMany({
    where: { id: { in: ids }, OR: [{ userId }, { userId: null }] },
  });
  return items
    .filter(
      (item) =>
        item.status === "ready" &&
        item.skill &&
        Array.isArray((item.skill as unknown as SkillDocLike).chapters),
    )
    .map((item) => item.skill as unknown as SkillDocLike);
}

/**
 * Resolves a plan draft's chapter assignments to display titles, keyed
 * `"${libraryItemId}:${chapterId}"`. Used at persist time so a `PlanTask`
 * chapter row carries its title directly — day reads never need a join back
 * to `LibraryItem` just to label a task.
 */
export async function loadChapterTitlesForAssignments(
  userId: string,
  assignments: readonly {
    kind: string;
    libraryItemId?: string;
    chapterId?: string;
  }[],
): Promise<Map<string, string>> {
  const chapterAssignments = assignments.filter(
    (
      assignment,
    ): assignment is {
      kind: "chapter";
      libraryItemId: string;
      chapterId: string;
    } =>
      assignment.kind === "chapter" &&
      typeof assignment.libraryItemId === "string" &&
      typeof assignment.chapterId === "string",
  );
  const ids = Array.from(
    new Set(
      chapterAssignments
        .map((assignment) => asBigInt(assignment.libraryItemId))
        .filter((id): id is bigint => id !== null),
    ),
  );
  if (ids.length === 0) return new Map();

  const items = await prisma.libraryItem.findMany({
    where: { id: { in: ids }, OR: [{ userId }, { userId: null }] },
  });

  const titleByKey = new Map<string, string>();
  for (const item of items) {
    const skill = item.skill as SkillDocLike | null;
    const chapters = Array.isArray(skill?.chapters) ? skill.chapters : [];
    for (const chapter of chapters) {
      const chapterId = chapter.id ?? chapter.title;
      titleByKey.set(`${item.id}:${chapterId}`, chapter.title);
    }
  }
  return titleByKey;
}
