import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  attachDayContent,
  deleteDayContentRecord,
  getDayContentRecord,
} from "~/features/day-study/services/attach-day-content";
import { DayNotFoundError } from "~/features/day-study/services/plan-day-lookup";
import { parseStringNumber } from "~/features/day-study/lib/parse-day-number";
import {
  extractText,
  UnsupportedFileError,
} from "~/server/ai/extract-text";
import { PlanNotFoundError } from "~/features/plan/services/plan-ownership";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

const attachTextSchema = z.object({
  title: z.string().trim().max(200).optional(),
  text: z.string().trim().min(40, "Attach at least a paragraph of content.").max(200_000),
});

function summarizeRecord(record: NonNullable<Awaited<ReturnType<typeof getDayContentRecord>>>) {
  const { skill, title, attachedAt } = record;
  return {
    attached: true,
    title,
    attachedAt,
    overview: skill.overview ?? "",
    chapterCount: skill.chapters.length,
    chapters: skill.chapters.map((chapter) => ({
      id: chapter.id ?? chapter.title,
      title: chapter.title,
      topics: chapter.topics ?? [],
    })),
  };
}

export const Route = createFileRoute("/api/ai/content/$planId/$dayNumber")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

        const dayNumber = parseStringNumber(params.dayNumber);
        if (dayNumber === null)
          return fail({ message: "Invalid day number", code: "VALIDATION_ERROR" }, { status: 422 });

        try {
          const record = await getDayContentRecord(user.id, params.planId, dayNumber);
          if (!record) return ok({ content: { attached: false } });
          return ok({ content: summarizeRecord(record) });
        } catch (error) {
          if (error instanceof PlanNotFoundError || error instanceof DayNotFoundError)
            return fail({ message: "Day not found", code: "NOT_FOUND" }, { status: 404 });
          throw error;
        }
      },

      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

        const dayNumber = parseStringNumber(params.dayNumber);
        if (dayNumber === null)
          return fail({ message: "Invalid day number", code: "VALIDATION_ERROR" }, { status: 422 });

        let title: string | undefined;
        let text = "";

        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("multipart/form-data")) {
          const form = await request.formData().catch(() => null);
          if (!form)
            return fail({ message: "Invalid upload", code: "VALIDATION_ERROR" }, { status: 422 });
          title = (form.get("title") as string | null)?.trim() || undefined;
          const pasted = (form.get("text") as string | null) ?? "";
          const file = form.get("file");
          if (file instanceof File && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            try {
              text = await extractText(file.name, buffer, file.type);
            } catch (error) {
              if (error instanceof UnsupportedFileError)
                return fail({ message: error.message, code: "VALIDATION_ERROR" }, { status: 422 });
              throw error;
            }
          }
          if (!text) text = pasted;
        } else {
          const body = await request.json().catch(() => null);
          const parsed = attachTextSchema.safeParse(body);
          if (!parsed.success) {
            return fail(
              {
                message: "Invalid request body",
                code: "VALIDATION_ERROR",
                details: { issues: parsed.error.issues },
              },
              { status: 422 },
            );
          }
          title = parsed.data.title;
          text = parsed.data.text;
        }

        if (!text || text.trim().length < 40) {
          return fail(
            { message: "Attach at least a paragraph of content.", code: "VALIDATION_ERROR" },
            { status: 422 },
          );
        }

        try {
          const { record, skill } = await attachDayContent({
            userId: user.id,
            planId: params.planId,
            dayNumber,
            title,
            text,
          });
          void skill;
          return ok({ content: summarizeRecord(record) }, { status: 201 });
        } catch (error) {
          if (error instanceof PlanNotFoundError || error instanceof DayNotFoundError)
            return fail({ message: "Day not found", code: "NOT_FOUND" }, { status: 404 });
          const message = error instanceof Error ? error.message : "Content attach failed.";
          return fail({ message, code: "DISTILLATION_ERROR" }, { status: 422 });
        }
      },

      DELETE: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

        const dayNumber = parseStringNumber(params.dayNumber);
        if (dayNumber === null)
          return fail({ message: "Invalid day number", code: "VALIDATION_ERROR" }, { status: 422 });

        try {
          const deleted = await deleteDayContentRecord(user.id, params.planId, dayNumber);
          return ok({ deleted });
        } catch (error) {
          if (error instanceof PlanNotFoundError || error instanceof DayNotFoundError)
            return fail({ message: "Day not found", code: "NOT_FOUND" }, { status: 404 });
          throw error;
        }
      },
    },
  },
});