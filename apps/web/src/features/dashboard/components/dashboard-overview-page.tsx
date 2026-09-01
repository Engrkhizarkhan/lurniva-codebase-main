import { Link, useRouteContext } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  Library,
  ListChecks,
  NotebookPen,
  Quote,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "@lurniva/ui";
import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { NOTE_CATEGORIES } from "../../day-study/constants/note-categories";
import {
  computePlanStats,
  getDayTaskProgressPct,
  getTodaysStudyDayNumber,
  summarizeDayTasks,
} from "../../plan/lib/plan-progress";
import { formatWeekdayShort } from "../../plan/lib/calendar";
import type { Plan, PlanDayDetail } from "../../plan/types";
import { useDashboardOverview } from "../hooks/useDashboardOverview";

const CATEGORY_COLOR_BY_ID: Record<string, string> = Object.fromEntries(
  NOTE_CATEGORIES.map((category) => [category.id, category.color]),
);

// Placeholder gamification/analytics figures — streaks, levels, notifications
// and weekly study-time tracking don't have a backend yet, so these are
// static until that data exists.
const STREAK_DAYS = 7;
const LEVEL = 3;
const LEVEL_TITLE = "Knowledge Seeker";
const XP_CURRENT = 320;
const XP_TARGET = 500;
const UNREAD_NOTIFICATIONS = 2;
const STUDY_TIME_THIS_WEEK = "4h 30m";
const STUDY_TIME_DELTA = "+12% from last week";
const QUESTIONS_ANSWERED = 42;
const QUESTIONS_DELTA = "+18% from last week";
const WEEKLY_PROGRESS_PCT = 60;

const POPULAR_TOPICS = [
  { icon: BookOpen, label: "Explain this topic" },
  { icon: ListChecks, label: "Quiz me on this" },
  { icon: FileText, label: "Summarize this" },
];

function todayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up studying?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTION_CLASS =
  "group flex items-center gap-3.5 rounded-card border border-border-subtle bg-surface-card p-4 shadow-xs transition-shadow duration-150 hover:shadow-md";

const QUICK_ACTION_TONE_CLASSES = {
  green: "bg-success-soft text-success",
  purple: "bg-violet-100 text-violet-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-warning-soft text-warning",
} as const;

type QuickActionTone = keyof typeof QUICK_ACTION_TONE_CLASSES;

interface QuickActionBodyProps {
  icon: LucideIcon;
  label: string;
  description: string;
  tone: QuickActionTone;
}

/** The shared visual content — callers wrap it in whichever `<Link>` variant their route needs. */
function QuickActionBody({ icon: ActionIcon, label, description, tone }: QuickActionBodyProps) {
  return (
    <>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-control ${QUICK_ACTION_TONE_CLASSES[tone]}`}
      >
        <ActionIcon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-text-heading">{label}</p>
        <p className="truncate text-xs text-text-muted">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="shrink-0 text-text-faint transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </>
  );
}

/** Goes to today's day when a plan has one, the plan itself when it's finished, or plan creation. */
function ContinueStudyingAction({
  planId,
  todaysDayNumber,
}: {
  planId: string | null;
  todaysDayNumber: number | null;
}) {
  if (!planId) {
    return (
      <Link to="/dashboard/plan/create" className={QUICK_ACTION_CLASS}>
        <QuickActionBody
          icon={CalendarCheck2}
          label="Create a study plan"
          description="Build your first plan"
          tone="green"
        />
      </Link>
    );
  }
  if (todaysDayNumber !== null) {
    return (
      <Link
        to="/dashboard/plan/$planId/day/$dayNumber"
        params={{ planId, dayNumber: String(todaysDayNumber) }}
        className={QUICK_ACTION_CLASS}
      >
        <QuickActionBody
          icon={CalendarCheck2}
          label="Continue studying"
          description="Pick up where you left off"
          tone="green"
        />
      </Link>
    );
  }
  return (
    <Link to="/dashboard/plan/$planId" params={{ planId }} className={QUICK_ACTION_CLASS}>
      <QuickActionBody
        icon={CalendarCheck2}
        label="Continue studying"
        description="View your finished plan"
        tone="green"
      />
    </Link>
  );
}

function HeroStat({ icon: StatIcon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-control bg-text-on-primary/10 px-3 py-2">
      <StatIcon size={15} className="shrink-0 text-text-on-primary/70" />
      <span className="text-xs text-text-on-primary/70">{label}</span>
      <span className="font-display text-sm font-bold">{value}</span>
    </div>
  );
}

function TodaysPlanCard({ plan, todaysDay }: { plan: Plan | null; todaysDay: PlanDayDetail | null }) {
  const todayLabel = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h3 className="font-display text-sm font-bold text-text-heading">Today&apos;s Plan</h3>
          <p className="text-xs text-text-muted">{todayLabel}</p>
        </div>
        {plan ? (
          <Link
            to="/dashboard/plan/$planId"
            params={{ planId: plan.id }}
            className="shrink-0 text-xs font-semibold text-text-link hover:text-text-link-hover"
          >
            View full plan
          </Link>
        ) : null}
      </div>

      {todaysDay && todaysDay.tasks.length > 0 ? (
        <ul className="grid gap-2.5">
          {todaysDay.tasks.map((task) => {
            const done = task.status === "completed";
            return (
              <li key={task.id} className="flex items-center gap-2.5 text-sm">
                {done ? (
                  <CheckCircle2 size={17} className="shrink-0 text-success" />
                ) : (
                  <Circle size={17} className="shrink-0 text-text-faint" />
                )}
                <span
                  className={
                    done
                      ? "flex-1 truncate text-text-faint line-through"
                      : "flex-1 truncate text-text-body"
                  }
                >
                  {task.subtopicLabel ?? task.topicLabel}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">
          {plan ? "No tasks scheduled for today." : "Create a plan to see today's tasks here."}
        </p>
      )}

      <p className="rounded-control bg-success-soft px-3 py-2 text-xs font-medium text-success">
        Small steps every day lead to big results. Keep going!
      </p>
    </div>
  );
}

function StudyStatsCard() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-text-heading">Study Stats</h3>
        <span className="text-xs font-medium text-text-muted">This week</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-control bg-success-soft p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-success">
            <Clock3 size={13} />
            Study time
          </div>
          <p className="mt-1 font-display text-lg font-extrabold text-text-heading">
            {STUDY_TIME_THIS_WEEK}
          </p>
          <p className="text-[11px] text-success">{STUDY_TIME_DELTA}</p>
        </div>
        <div className="rounded-control bg-violet-100 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-violet-600">
            <Sparkles size={13} />
            Questions
          </div>
          <p className="mt-1 font-display text-lg font-extrabold text-text-heading">
            {QUESTIONS_ANSWERED}
          </p>
          <p className="text-[11px] text-violet-600">{QUESTIONS_DELTA}</p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Weekly progress</span>
          <span className="font-semibold text-text-heading">{WEEKLY_PROGRESS_PCT}%</span>
        </div>
        <ProgressBar value={WEEKLY_PROGRESS_PCT} tone="success" size="sm" />
        <p className="text-[11px] text-text-muted">Keep it up! You&apos;re doing great.</p>
      </div>
    </div>
  );
}

function QuickAiHelpCard() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface-card p-5 shadow-xs">
      <div className="grid gap-1">
        <h3 className="font-display text-sm font-bold text-text-heading">Quick AI Help</h3>
        <p className="text-xs text-text-muted">Ask anything about your studies and get instant help.</p>
      </div>

      <Link
        to="/dashboard/ai-study"
        className="inline-flex items-center justify-center gap-2 rounded-control bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
      >
        <Sparkles size={15} />
        Ask AI Tutor
      </Link>

      <div className="grid gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
          Popular topics
        </span>
        {POPULAR_TOPICS.map(({ icon: TopicIcon, label }) => (
          <Link
            key={label}
            to="/dashboard/ai-study"
            className="group flex items-center gap-2.5 rounded-control px-2 py-2 text-sm font-medium text-text-body hover:bg-surface-sunken"
          >
            <TopicIcon size={15} className="shrink-0 text-text-faint" />
            <span className="flex-1 truncate">{label}</span>
            <ArrowRight
              size={13}
              className="shrink-0 text-text-faint transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverviewPage() {
  const { user } = useRouteContext({ from: "/dashboard" });
  const { data: overview, isLoading, isError, refetch } = useDashboardOverview();

  const displayName = overview?.userName || user?.email?.split("@")[0] || "there";

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
        <SkeletonLoading className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <SkeletonLoading key={key} className="h-20 rounded-card" />
          ))}
        </div>
        <SkeletonLoading className="h-48 rounded-card" />
        <SkeletonLoading className="h-40 rounded-card" />
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <ErrorState
          description="We couldn't load your dashboard. Check your connection and try again."
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  const { plan, recentNotes, notesCount } = overview;
  const days = plan?.days ?? [];
  const todaysDayNumber = plan ? getTodaysStudyDayNumber(days) : null;
  const todaysDay = days.find((day) => day.dayNumber === todaysDayNumber) ?? null;
  const todaysSummary = todaysDay ? summarizeDayTasks(todaysDay.tasks) : null;
  const stats = plan ? computePlanStats(days) : null;
  const daysLeft = stats ? Math.max(0, stats.totalDays - stats.completedDays) : 0;
  const topicsLeft = stats ? Math.max(0, stats.totalTasks - stats.completedTasks) : 0;
  const todaysProgressPct = todaysDay ? getDayTaskProgressPct(todaysDay) : 0;
  const overallProgressPct = stats?.progressPct ?? 0;
  const xpPct = Math.min(100, Math.round((XP_CURRENT / XP_TARGET) * 100));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-[-0.01em] text-text-heading">
            {todayGreeting()}, {displayName}
            <span aria-hidden>👋</span>
          </h1>
          <p className="text-sm text-text-muted">
            Ready to make today amazing? Let&apos;s keep your streak alive!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-card border border-border-subtle bg-surface-card px-3.5 py-2 shadow-xs">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
              <Flame size={16} />
            </span>
            <div className="grid leading-tight">
              <span className="font-display text-sm font-extrabold text-text-heading">
                {STREAK_DAYS}
              </span>
              <span className="text-[11px] text-text-muted">Day streak</span>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-card border border-border-subtle bg-surface-card px-3.5 py-2 shadow-xs sm:flex">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
              <GraduationCap size={16} />
            </span>
            <div className="grid gap-0.5 leading-tight">
              <span className="font-display text-sm font-extrabold text-text-heading">
                Level {LEVEL}
              </span>
              <span className="text-[11px] text-text-muted">{LEVEL_TITLE}</span>
              <div className="mt-0.5 h-1 w-24 overflow-hidden rounded-pill bg-surface-sunken">
                <div className="h-full rounded-pill bg-success" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-muted shadow-xs transition-colors duration-150 hover:text-text-heading"
          >
            <Bell size={18} />
            {UNREAD_NOTIFICATIONS > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                {UNREAD_NOTIFICATIONS}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ContinueStudyingAction planId={plan?.id ?? null} todaysDayNumber={todaysDayNumber} />

        <Link to="/dashboard/ai-study" className={QUICK_ACTION_CLASS}>
          <QuickActionBody
            icon={Sparkles}
            label="AI Study"
            description="Ask your tutor anything"
            tone="purple"
          />
        </Link>

        <Link to="/dashboard/library" className={QUICK_ACTION_CLASS}>
          <QuickActionBody
            icon={Library}
            label="Library"
            description="Browse your study material"
            tone="blue"
          />
        </Link>

        <Link to="/dashboard/my-notes" className={QUICK_ACTION_CLASS}>
          <QuickActionBody
            icon={NotebookPen}
            label="My Notes"
            description={notesCount > 0 ? `${notesCount} saved` : "Nothing saved yet"}
            tone="amber"
          />
        </Link>
      </div>

      {!plan ? (
        <section className="grid gap-4 rounded-card border border-border-subtle bg-surface-card p-6 shadow-xs">
          <div className="flex flex-col items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CalendarPlus size={20} />
            </span>
            <div className="grid gap-1">
              <h2 className="font-display text-lg font-bold text-text-heading">
                You do not have a study plan yet
              </h2>
              <p className="text-sm text-text-muted">
                Build one and Lurniva will tell you exactly what to study each day.
              </p>
            </div>
            <Link
              to="/dashboard/plan/create"
              className="mt-1 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-text-on-primary transition-colors duration-150 hover:bg-primary-hover"
            >
              Create a study plan
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            <section className="relative overflow-hidden rounded-card bg-surface-inverse p-6 text-text-on-primary shadow-md">
              <GraduationCap
                size={140}
                strokeWidth={1}
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-6 hidden text-text-on-primary/10 md:block"
              />

              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-on-primary/50">
                    {plan.name}
                  </span>
                  {todaysDay ? (
                    <>
                      <h2 className="font-display text-lg font-bold">
                        Day {todaysDay.dayNumber}
                        {todaysDay.isRestDay
                          ? " · Rest day"
                          : ` • ${formatWeekdayShort(todaysDay.scheduledDate)}`}
                      </h2>
                      {!todaysDay.isRestDay && todaysSummary ? (
                        <p className="text-sm text-text-on-primary/70">
                          {todaysSummary.title}
                          {todaysSummary.subtitle ? ` — ${todaysSummary.subtitle}` : ""}
                        </p>
                      ) : todaysDay.isRestDay ? (
                        <p className="text-sm text-text-on-primary/70">
                          No topics scheduled today — take the day to recover.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <h2 className="font-display text-lg font-bold">Plan complete</h2>
                  )}
                </div>

                {todaysDay && !todaysDay.isRestDay ? (
                  <Link
                    to="/dashboard/plan/$planId/day/$dayNumber"
                    params={{ planId: plan.id, dayNumber: String(todaysDay.dayNumber) }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-control bg-primary-active px-4 py-2.5 text-sm font-semibold text-text-on-primary transition-colors duration-150 hover:opacity-90"
                  >
                    {todaysProgressPct > 0 ? "Continue learning" : "Start learning"}
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/plan/$planId"
                    params={{ planId: plan.id }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-control border border-text-on-primary/25 px-4 py-2.5 text-sm font-semibold text-text-on-primary transition-colors duration-150 hover:bg-text-on-primary/10"
                  >
                    View plan
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>

              <div className="relative mt-5 grid gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-extrabold">{overallProgressPct}%</span>
                  <span className="text-xs text-text-on-primary/60">Overall progress</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-pill bg-text-on-primary/15">
                  <div
                    className="h-full rounded-pill bg-accent transition-[width] duration-300 ease-standard"
                    style={{ width: `${overallProgressPct}%` }}
                  />
                </div>
                <p className="text-xs text-text-on-primary/60">
                  {overallProgressPct > 0
                    ? "Keep it up — you're making great progress."
                    : "You've got this! Let's start learning."}
                </p>
              </div>

              <div className="relative mt-5 flex flex-wrap gap-3">
                <HeroStat icon={CalendarCheck2} label="Days left" value={String(daysLeft)} />
                <HeroStat icon={ListChecks} label="Topics left" value={String(topicsLeft)} />
                <HeroStat
                  icon={CheckCircle2}
                  label="Days completed"
                  value={`${stats?.completedDays ?? 0}/${stats?.totalDays ?? 0}`}
                />
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <TodaysPlanCard plan={plan} todaysDay={todaysDay} />
              <StudyStatsCard />
            </div>
          </div>

          <div className="grid gap-4">
            <QuickAiHelpCard />
          </div>
        </div>
      )}

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-text-heading">Recent notes</h2>
          <Link
            to="/dashboard/my-notes"
            className="inline-flex items-center gap-1 text-sm font-semibold text-text-link hover:text-text-link-hover"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="flex items-center gap-3 rounded-card border border-dashed border-border-subtle bg-surface-raised px-5 py-6">
            <BookOpen size={20} className="shrink-0 text-text-faint" />
            <p className="text-sm text-text-muted">
              Highlight something in the AI study workspace and it will show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface-card p-4 shadow-xs"
              >
                <Quote
                  size={15}
                  style={{ color: CATEGORY_COLOR_BY_ID[note.categoryId] ?? "var(--color-sand-400)" }}
                />
                <p className="line-clamp-3 text-sm leading-relaxed text-text-body">{note.text}</p>
                {note.sourceLabel ? (
                  <p className="truncate text-xs text-text-faint">{note.sourceLabel}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
