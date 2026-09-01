export interface OnboardingSidePanelStat {
  value: string;
  label: string;
}

export interface OnboardingSidePanelProps {
  heading: string;
  subtitle: string;
  imagePlaceholder: string;
  stats?: OnboardingSidePanelStat[];
}

export function OnboardingSidePanel({
  heading,
  subtitle,
  imagePlaceholder,
  stats,
}: OnboardingSidePanelProps) {
  return (
    <div className="hidden w-80 flex-col justify-between gap-5 bg-surface-inverse-soft p-8 md:flex">
      <div className="grid gap-2">
        <h3 className="font-display text-xl font-bold text-lime-100">
          {heading}
        </h3>
        <p className="text-sm text-forest-050">{subtitle}</p>
      </div>
      <div
        role="img"
        aria-label={imagePlaceholder}
        className="flex h-[220px] items-center justify-center rounded-lg bg-forest-600/40 text-center text-xs text-forest-050"
      >
        {imagePlaceholder}
      </div>
      {stats ? (
        <div className="flex justify-between">
          {stats.map((stat) => (
            <div key={stat.label} className="grid gap-0.5">
              <span className="font-display text-lg font-extrabold tabular-nums text-lime-500">
                {stat.value}
              </span>
              <span className="text-xs text-forest-050">{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
