import { CalendarRange, Pencil, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Plan } from "../../types";
import { formatDateRange, getDurationDays } from "../../types";

export interface PlanListItemProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

function ActionButtons({ plan, onEdit, onDelete }: PlanListItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Edit ${plan.name}`}
        onClick={() => onEdit(plan)}
        className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-body"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        aria-label={`Delete ${plan.name}`}
        onClick={() => onDelete(plan)}
        className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error-soft hover:text-error"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanListRow — desktop/tablet table row (rendered inside <table>)
// ---------------------------------------------------------------------------

export function PlanListRow({ plan, onEdit, onDelete }: PlanListItemProps) {
  const durationDays = getDurationDays(plan.startDate, plan.endDate);

  return (
    <tr className="border-b border-border-subtle transition-colors last:border-0 hover:bg-surface-sunken/60">
      <td className="px-5 py-4">
        <Link
          to="/dashboard/plan/$planId"
          params={{ planId: plan.id }}
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <CalendarRange size={18} className="text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-heading hover:text-primary">
              {plan.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              {formatDateRange(plan.startDate, plan.endDate)}
            </p>
          </div>
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-text-body">
        {durationDays} {durationDays === 1 ? "day" : "days"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-text-body">
        {plan.studyHoursPerDay} hrs/day
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <ActionButtons plan={plan} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// PlanListCard — stacked layout for small screens
// ---------------------------------------------------------------------------

export function PlanListCard({ plan, onEdit, onDelete }: PlanListItemProps) {
  const durationDays = getDurationDays(plan.startDate, plan.endDate);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Link
          to="/dashboard/plan/$planId"
          params={{ planId: plan.id }}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <CalendarRange size={18} className="text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-text-heading">
              {plan.name}
            </p>
            <p className="truncate text-xs text-text-muted">
              {formatDateRange(plan.startDate, plan.endDate)}
            </p>
          </div>
        </Link>
        <ActionButtons plan={plan} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <div className="flex items-center gap-2.5 text-sm text-text-body">
        <span className="font-medium">
          {durationDays} {durationDays === 1 ? "day" : "days"}
        </span>
        <span className="size-1 shrink-0 rounded-full bg-border-default" />
        <span>{plan.studyHoursPerDay} hrs/day</span>
      </div>
    </div>
  );
}
