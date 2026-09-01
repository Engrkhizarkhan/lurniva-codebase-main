import { CheckCircle2 } from "lucide-react";
import type { CatalogSubject, CreatePlanDraft } from "../../../create-plan-types";
import type { DayGridEntry } from "../../../lib/timeline-math";
import type { LibraryItemDto } from "../../../../library/services/library-items";
import { formatDateRange } from "../../../types";
import { ReviewScheduleList } from "../review/review-schedule-list";
import { ReviewSummary } from "../review/review-summary";

interface StepReviewProps {
  draft: CreatePlanDraft;
  subjects: CatalogSubject[];
  libraryItems: LibraryItemDto[];
  days: DayGridEntry[];
  totalTopicsSelected: number;
  restDayCount: number;
  librarySelectedCount: number;
  submitError: string | null;
  bannerText?: string;
}

export function StepReview({
  draft,
  subjects,
  libraryItems,
  days,
  totalTopicsSelected,
  restDayCount,
  librarySelectedCount,
  submitError,
  bannerText = "Everything looks good. Your study plan is ready to go.",
}: StepReviewProps) {
  const hasAssignments = days.some((day) => day.assignments.length > 0);
  const studyDays = hasAssignments
    ? days.filter((day) => day.assignments.length > 0).length
    : days.filter((day) => !day.isRest).length;
  const dailyStudyHours = draft.basicInfo.dailyStudyHours ?? 0;
  const totalHours = Math.round(studyDays * dailyStudyHours);

  const durationLabel =
    draft.schedule.startDate && draft.schedule.endDate
      ? formatDateRange(draft.schedule.startDate, draft.schedule.endDate)
      : "—";

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
        <CheckCircle2 size={16} />
        {bannerText}
      </div>

      <ReviewSummary
        planName={draft.basicInfo.name?.trim() || "Untitled study plan"}
        durationLabel={durationLabel}
        studyDays={studyDays}
        totalHours={totalHours}
        totalTopics={totalTopicsSelected}
        restDays={restDayCount}
        libraryCount={librarySelectedCount}
      />

      <ReviewScheduleList
        subjects={subjects}
        libraryItems={libraryItems}
        days={days}
        librarySelected={librarySelectedCount > 0}
      />

      {submitError ? (
        <p role="alert" className="text-sm text-error">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}
