import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Plan } from "../../types";
import { PlanListCard, PlanListRow } from "./plan-list-item";

const COLUMN_HEADERS = ["Plan name", "Duration", "Study time/day", ""];

export interface PlanListProps {
  plans: Plan[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

export function PlanList({
  plans,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: PlanListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm">
        <table className="hidden w-full md:table">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-sunken/60">
              {COLUMN_HEADERS.map((header) => (
                <th
                  key={header || "actions"}
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-faint"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <PlanListRow
                key={plan.id}
                plan={plan}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>

        <div className="flex flex-col divide-y divide-border-subtle md:hidden">
          {plans.map((plan) => (
            <PlanListCard
              key={plan.id}
              plan={plan}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {totalPages > 1 ? (
        <PlanListPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanListPagination
// ---------------------------------------------------------------------------

interface PlanListPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function PlanListPagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: PlanListPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm">
      <p className="text-text-muted">{totalCount} plans total</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-body transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-20 text-center font-medium text-text-body">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-body transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
