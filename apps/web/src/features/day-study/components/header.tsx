import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StudyToolsMenu } from "./study-tools-menu";

interface DayStudyHeaderProps {
  planName: string;
  dayNumber: number;
  topicTitle: string;
}

export function DayStudyHeader({
  planName,
  dayNumber,
  topicTitle,
}: DayStudyHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-4 bg-white p-3">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard/plan"
            className="group flex shrink-0 items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-heading"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-subtle transition-colors group-hover:border-border-default group-hover:bg-surface-card">
              <ArrowLeft
                size={12}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </span>
            <span className="max-w-45 truncate">{planName}</span>
          </Link>
          <span className="h-5 w-px shrink-0 bg-border-default" />
          <h3 className="truncate shrink-0 text-base font-semibold text-primary">
            Day {dayNumber}
            {topicTitle ? ` : ${topicTitle}` : ""}
          </h3>
        </div>
        <StudyToolsMenu />
      </div>
    </header>
  );
}