import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  Lock,
  Moon,
  X,
} from "lucide-react";
import { Button, ProgressBar, cn } from "@lurniva/ui";
import type { PlanDayDetail } from "../../types";
import { formatWeekdayShort } from "../../lib/calendar";
import {
  getDayStatusMeta,
  getDayTaskProgressPct,
  summarizeDayTasks,
} from "../../lib/plan-progress";

interface PlanDayListProps {
  planId: string;
  days: PlanDayDetail[];
}

export function PlanDayList({ planId, days }: PlanDayListProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface-card shadow-xs">
      {days.map((day) => (
        <PlanDayRow key={day.dayNumber} planId={planId} day={day} />
      ))}
    </div>
  );
}

interface DayMarkerProps {
  status: PlanDayDetail["status"];
  isRestDay: boolean;
}

function DayMarker({ status, isRestDay }: DayMarkerProps) {
  if (isRestDay) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-sunken">
        <Moon size={14} className="text-text-muted" />
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success">
        <Check size={16} className="text-text-on-primary" />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-success bg-surface-card">
        <div className="size-3 rounded-full bg-success" />
      </div>
    );
  }
  if (status === "skipped") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-warning bg-warning-soft">
        <X size={14} className="text-warning" />
      </div>
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-sunken">
      <Lock size={14} className="text-text-muted" />
    </div>
  );
}

function PlanDayRow({ planId, day }: { planId: string; day: PlanDayDetail }) {
  const meta = getDayStatusMeta(day.status);
  const { title, subtitle } = summarizeDayTasks(day.tasks);
  const dayProgressPct = getDayTaskProgressPct(day);

  if (day.isRestDay) {
    return (
      <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex shrink-0 items-center gap-3 sm:w-40">
          <DayMarker status={day.status} isRestDay={day.isRestDay} />
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-text-heading">
              Day {day.dayNumber}
            </span>
            <span className="text-xs text-text-muted">
              {formatWeekdayShort(day.scheduledDate)}
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 text-sm font-semibold text-text-muted">
          <Moon size={14} />
          Rest day
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/dashboard/plan/$planId/day/$dayNumber"
      params={{ planId, dayNumber: String(day.dayNumber) }}
      className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 outline-none transition-colors duration-150 last:border-0 hover:bg-surface-subtle focus-visible:bg-surface-subtle sm:flex-row sm:items-center sm:gap-5"
    >
      <div className="flex shrink-0 items-center gap-3 sm:w-40">
        <DayMarker status={day.status} isRestDay={day.isRestDay} />
        <div className="flex flex-col">
          <span className="font-display text-sm font-bold text-text-heading">
            Day {day.dayNumber}
          </span>
          <span className="text-xs text-text-muted">
            {formatWeekdayShort(day.scheduledDate)}
          </span>
        </div>
      </div>

      <span
        className={cn(
          "w-fit shrink-0 rounded-pill px-2.5 py-1 text-xs font-semibold sm:w-28",
          meta.toneClasses,
        )}
      >
        {meta.label}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-text-heading">{title}</p>
        <p className="truncate text-xs text-text-muted">{subtitle}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-3 text-text-muted lg:flex">
        <FileText size={17} />
        <Copy size={17} />
        <HelpCircle size={17} />
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        {day.status === "completed" ? (
          <span className="inline-flex items-center rounded-pill bg-success-soft px-2.5 py-1 text-xs font-bold text-success">
            {dayProgressPct}%
          </span>
        ) : null}
        {day.status === "in_progress" ? (
          <>
            <ProgressBar value={dayProgressPct} tone="success" size="sm" className="w-20" />
            <span className="text-xs font-semibold text-text-heading">{dayProgressPct}%</span>
            <Button variant="primary" size="sm">
              Continue learning
            </Button>
          </>
        ) : null}
      </div>

      <ChevronRight size={18} className="hidden shrink-0 text-text-muted lg:block" />
    </Link>
  );
}
