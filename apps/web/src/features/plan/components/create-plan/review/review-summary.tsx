interface ReviewSummaryProps {
  planName: string;
  durationLabel: string;
  studyDays: number;
  totalHours: number;
  totalTopics: number;
  restDays: number;
  libraryCount: number;
}

export function ReviewSummary({
  planName,
  durationLabel,
  studyDays,
  totalHours,
  totalTopics,
  restDays,
  libraryCount,
}: ReviewSummaryProps) {
  const stats = [
    { label: "Plan duration", value: durationLabel },
    { label: "Study days", value: String(studyDays) },
    { label: "Total study hours", value: String(totalHours) },
    { label: "Topics selected", value: String(totalTopics) },
    { label: "Library resources", value: String(libraryCount) },
    { label: "Rest days", value: String(restDays) },
  ];

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <h2 className="text-lg font-bold text-text-heading">{planName}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface-sunken p-3">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-0.5 text-sm font-bold text-text-heading">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
