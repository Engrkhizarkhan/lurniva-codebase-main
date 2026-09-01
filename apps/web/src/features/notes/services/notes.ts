import { prisma } from "@lurniva/db";
import type { StudyNote as StudyNoteRow } from "@lurniva/db";
import type { StudyNote } from "../../day-study/types";
import type { CreateStudyNoteInput } from "../validation/notes";

/** Notes accumulate slowly (one per highlight), so a flat cap is plenty. */
const MAX_NOTES = 500;

function toStudyNote(row: StudyNoteRow): StudyNote {
  return {
    id: row.id.toString(),
    text: row.text,
    categoryId: row.categoryId,
    sourceLabel: row.sourceLabel,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listStudyNotes(userId: string): Promise<StudyNote[]> {
  const rows = await prisma.studyNote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_NOTES,
  });
  return rows.map(toStudyNote);
}

export async function createStudyNote(
  userId: string,
  input: CreateStudyNoteInput,
): Promise<StudyNote> {
  const row = await prisma.studyNote.create({
    data: {
      userId,
      text: input.text,
      categoryId: input.categoryId,
      sourceLabel: input.sourceLabel ?? null,
    },
  });
  return toStudyNote(row);
}

/** Returns whether a note owned by `userId` was actually deleted. */
export async function deleteStudyNote(
  userId: string,
  noteId: string,
): Promise<boolean> {
  let id: bigint;
  try {
    id = BigInt(noteId);
  } catch {
    return false;
  }
  const result = await prisma.studyNote.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
