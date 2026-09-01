import { CalendarCheck2, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlanDayDetail } from "../../types";
import { computePlanStats } from "../../lib/plan-progress";

interface PlanProgressSummaryProps {
  days: PlanDayDetail[];
}

const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative size-14 shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="6"
        />
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--success)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-text-heading">
        {clamped}%
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function StatTile({ icon: TileIcon, label, value }: StatTileProps) {
  return (
    <div className="flex flex-1 items-center gap-3 border-t border-border-subtle pt-4 sm:border-t-0 sm:border-l sm:px-6 sm:pt-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
        <TileIcon size={18} className="text-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="font-display text-lg font-bold text-text-heading">
          {value}
        </span>
      </div>
    </div>
  );
}

export function PlanProgressSummary({ days }: PlanProgressSummaryProps) {
  const stats = computePlanStats(days);

  return (
    <div className="flex flex-col gap-5 rounded-card border border-border-subtle bg-surface-card p-6 shadow-xs sm:flex-row sm:items-center sm:gap-0">
      <div className="flex flex-1 items-center gap-4 sm:pr-6">
        <ProgressRing pct={stats.progressPct} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-text-muted">Overall progress</span>
          <span className="text-sm font-bold text-text-heading">
            {stats.completedTasks} of {stats.totalTasks} topics completed
          </span>
        </div>
      </div>

      <StatTile
        icon={CalendarCheck2}
        label="Days completed"
        value={`${stats.completedDays} / ${stats.totalDays}`}
      />
      <StatTile
        icon={CheckCircle2}
        label="Topics completed"
        value={`${stats.completedTasks} / ${stats.totalTasks}`}
      />
    </div>
  );
}
