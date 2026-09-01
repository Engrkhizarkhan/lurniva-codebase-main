import { useEffect, useState } from "react";
import type { ReactNode, SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { Button } from "@lurniva/ui";
import { AlertModal } from "~/shared/components/alert-modal";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { usePlansList } from "../hooks/usePlansList";
import type { Plan, PlanFormValues } from "../types";
import { PlanList } from "./plans-list/plan-list";

// ---------------------------------------------------------------------------
// PlanListSkeleton — loading placeholder shaped like the table
// ---------------------------------------------------------------------------
function PlanListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <SkeletonLoading className="size-10 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <SkeletonLoading className="h-4 w-1/3" />
              <SkeletonLoading className="h-3 w-1/4" />
            </div>
            <SkeletonLoading className="hidden h-4 w-16 sm:block" />
            <SkeletonLoading className="hidden h-4 w-24 sm:block" />
            <SkeletonLoading className="size-8 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StateTransition — fades content in whenever its key changes
// ---------------------------------------------------------------------------

function StateTransition({ children }: { children: ReactNode }) {
  return <div className="animate-[fade-in_250ms_ease-out]">{children}</div>;
}

// ---------------------------------------------------------------------------
// Modal — shared overlay shell for the edit dialog
// ---------------------------------------------------------------------------

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-surface-overlay p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-lg animate-[fade-up-in_var(--dur-modal)_var(--ease-spring)]"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-text-heading">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-sunken"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditPlanModal
// ---------------------------------------------------------------------------

interface EditPlanModalProps {
  plan: Plan | null;
  onClose: () => void;
  onSave: (id: string, values: PlanFormValues) => void;
  onEditFullPlan: (plan: Plan) => void;
}

function EditPlanModal({
  plan,
  onClose,
  onSave,
  onEditFullPlan,
}: EditPlanModalProps) {
  const [values, setValues] = useState<PlanFormValues>(() =>
    plan
      ? {
          name: plan.name,
          startDate: plan.startDate,
          endDate: plan.endDate,
          studyHoursPerDay: plan.studyHoursPerDay,
        }
      : { name: "", startDate: "", endDate: "", studyHoursPerDay: 1 },
  );

  const canSave =
    values.name.trim().length > 0 &&
    values.startDate.length > 0 &&
    values.endDate.length > 0 &&
    values.endDate >= values.startDate;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan || !canSave) return;
    onSave(plan.id, values);
  }

  return (
    <Modal open={plan !== null} title="Edit plan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-3.5">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-text-body">Plan name</span>
          <input
            type="text"
            required
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            className="rounded-lg border border-border-subtle bg-surface-canvas px-3 py-2 text-sm text-text-body focus:border-border-focus focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-3.5">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-text-body">Start date</span>
            <input
              type="date"
              required
              value={values.startDate}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="rounded-lg border border-border-subtle bg-surface-canvas px-3 py-2 text-sm text-text-body focus:border-border-focus focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-text-body">End date</span>
            <input
              type="date"
              required
              value={values.endDate}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              className="rounded-lg border border-border-subtle bg-surface-canvas px-3 py-2 text-sm text-text-body focus:border-border-focus focus:outline-none"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-text-body">
            Study time / day (hrs)
          </span>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={values.studyHoursPerDay}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                studyHoursPerDay: Number(event.target.value),
              }))
            }
            className="rounded-lg border border-border-subtle bg-surface-canvas px-3 py-2 text-sm text-text-body focus:border-border-focus focus:outline-none"
          />
        </label>

        <p className="text-xs text-text-muted">
          Need to change subjects, schedule, or day assignments?{" "}
          <button
            type="button"
            onClick={() => plan && onEditFullPlan(plan)}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Edit full plan →
          </button>
        </p>

        <div className="mt-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// PlanDashboard
// ---------------------------------------------------------------------------

export function PlanDashboard() {
  const navigate = useNavigate();
  const {
    plans,
    totalCount,
    status,
    page,
    totalPages,
    setPage,
    refetch,
    deletePlan,
    updatePlan,
  } = usePlansList();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  function goToCreatePlan() {
    navigate({ to: "/dashboard/plan/create" });
  }

  function handleDelete(plan: Plan) {
    setDeletingPlan(plan);
  }

  function handleConfirmDelete() {
    if (deletingPlan) deletePlan(deletingPlan.id);
  }

  function handleSave(id: string, values: PlanFormValues) {
    updatePlan(id, values);
    setEditingPlan(null);
  }

  function handleEditFullPlan(plan: Plan) {
    setEditingPlan(null);
    navigate({
      to: "/dashboard/plan/edit/$planId",
      params: { planId: plan.id },
    });
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-heading">My Plans</h1>
          <p className="mt-1 text-sm text-text-muted">
            All your study plans in one place. Stay organized and in control.
          </p>
        </div>

        <Button icon={<Plus size={16} />} onClick={goToCreatePlan}>
          Create plan
        </Button>
      </div>

      <StateTransition key={status}>
        {status === "loading" ? <PlanListSkeleton /> : null}

        {status === "error" ? <ErrorState onAction={refetch} /> : null}

        {status === "empty" ? (
          <EmptyState
            title="No plans created yet"
            description="Create your first study plan to see it listed here."
            actionLabel="Create plan"
            onAction={goToCreatePlan}
          />
        ) : null}

        {status === "ready" ? (
          <PlanList
            plans={plans}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={setEditingPlan}
            onDelete={handleDelete}
          />
        ) : null}
      </StateTransition>

      <EditPlanModal
        key={editingPlan?.id ?? "closed"}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={handleSave}
        onEditFullPlan={handleEditFullPlan}
      />

      <AlertModal
        open={deletingPlan !== null}
        title="Delete plan"
        text={
          deletingPlan
            ? `Delete "${deletingPlan.name}"? This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingPlan(null)}
      />
    </div>
  );
}

export default PlanDashboard;
