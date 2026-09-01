import { Star } from "lucide-react";
import { cn } from "@lurniva/ui";
import { formatCurrency } from "@lurniva/utils";
import type { TeacherAvailability, TeacherDto } from "../types";

const AVAILABILITY_LABEL: Record<TeacherAvailability, string> = {
  available: "Available",
  limited: "Limited",
  full: "Full",
};

const AVAILABILITY_CLASSES: Record<TeacherAvailability, string> = {
  available: "bg-success-soft text-success",
  limited: "bg-warning-soft text-color-amber-600",
  full: "bg-error-soft text-error",
};

/** Two initials from a display name — teacher rows carry no avatar image yet. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Rating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star
            key={index}
            size={13}
            className={cn(
              index < Math.round(value)
                ? "fill-color-amber-500 text-color-amber-500"
                : "fill-transparent text-border-default",
            )}
          />
        ))}
      </span>
      <span className="text-xs text-text-muted tabular-nums">
        {value.toFixed(1)} <span className="text-text-faint">({count})</span>
      </span>
    </div>
  );
}

export function TeacherCard({ teacher }: { teacher: TeacherDto }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-card border border-border-subtle bg-surface-card p-5 shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start gap-3.5">
        {teacher.avatarUrl ? (
          <img
            src={teacher.avatarUrl}
            alt=""
            className="size-11 shrink-0 rounded-control object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-control bg-surface-subtle font-display text-sm font-bold text-primary"
          >
            {initialsOf(teacher.name)}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate font-display text-[17px] font-bold text-text-heading">
            {teacher.name}
          </h3>
          <p className="truncate text-[13px] text-text-muted">
            {teacher.headline}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-pill px-2.5 py-1 text-xs font-semibold",
            AVAILABILITY_CLASSES[teacher.availability],
          )}
        >
          {AVAILABILITY_LABEL[teacher.availability]}
        </span>
      </div>

      {teacher.rating !== null ? (
        <Rating value={teacher.rating} count={teacher.reviewCount} />
      ) : null}

      {teacher.bio ? (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-text-muted">
          {teacher.bio}
        </p>
      ) : null}

      {teacher.subjects.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {teacher.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-pill border border-border-subtle bg-surface-raised px-2.5 py-0.5 text-xs text-text-muted"
            >
              {subject}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-baseline gap-1.5 border-t border-border-subtle pt-3">
        <span className="font-display text-base font-bold text-text-heading tabular-nums">
          {formatCurrency(teacher.monthlyFee)}
        </span>
        <span className="text-[13px] text-text-muted">per month</span>
      </div>
    </article>
  );
}
