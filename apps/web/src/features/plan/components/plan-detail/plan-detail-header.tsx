import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck2,
  Pencil,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@lurniva/ui";
import type { Plan } from "../../types";
import { formatDateRange, getDurationDays } from "../../types";

interface PlanDetailHeaderProps {
  plan: Plan;
  todaysDayNumber: number | null;
}

export function PlanDetailHeader({ plan, todaysDayNumber }: PlanDetailHeaderProps) {
  const navigate = useNavigate();
  const durationDays = getDurationDays(plan.startDate, plan.endDate);

  function goToSettings() {
    navigate({
      to: "/dashboard/plan/edit/$planId",
      params: { planId: plan.id },
    });
  }

  function goToTodaysStudy() {
    if (todaysDayNumber === null) return;
    navigate({
      to: "/dashboard/plan/$planId/day/$dayNumber",
      params: { planId: plan.id, dayNumber: String(todaysDayNumber) },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/dashboard/plan"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-text-body"
      >
        <ArrowLeft size={16} />
        Back to My Plans
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft">
              <CalendarCheck2 size={18} className="text-primary" />
            </div>
            <h1 className="truncate font-display text-2xl font-extrabold text-text-heading sm:text-[28px]">
              {plan.name}
            </h1>
            <button
              type="button"
              aria-label="Edit plan name"
              onClick={goToSettings}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-body"
            >
              <Pencil size={15} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Calendar size={15} />
            <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
            <span className="size-1 shrink-0 rounded-full bg-border-default" />
            <span>
              {durationDays} {durationDays === 1 ? "day" : "days"}
            </span>
            <span className="size-1 shrink-0 rounded-full bg-border-default" />
            <span>{plan.studyHoursPerDay} hrs/day</span>
          </div>

          <p className="text-sm text-text-muted">
            Great plans lead to great scores. Stay consistent and crush it!
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            icon={<Settings size={16} />}
            onClick={goToSettings}
          >
            Plan settings
          </Button>
          <Button
            variant="primary"
            iconAfter={<ArrowRight size={16} />}
            onClick={goToTodaysStudy}
            disabled={todaysDayNumber === null}
          >
            Start learning
          </Button>
        </div>
      </div>
    </div>
  );
}
