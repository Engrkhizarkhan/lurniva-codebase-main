import { AIBadge, Icon } from "@lurniva/ui";
import { MiniProgressBar } from "@/components/ui/mini-progress-bar";
import type { Shell } from "@/lib/data/shells";

/** A static mock of the product UI for one seat (student/teacher/institute/organization) — sidebar, stats, a progress list and an AI panel. */
export function ProductShellMock({ shell }: { shell: Shell }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-md">
      <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-[236px_minmax(0,1fr)]">
        <div className="hidden content-start gap-1.5 bg-surface-inverse p-4 md:grid">
          <div className="flex items-center gap-2.5 px-2 pb-4.5">
            <span className="grid size-6 place-items-center rounded-[7px] bg-forest-700 text-lime-500">
              <Icon name="feather" size={14} />
            </span>
            <span className="font-display text-base font-extrabold text-cream-100">
              {shell.title}
            </span>
          </div>
          {shell.nav.map((item, index) => (
            <span
              key={item.label}
              className={`flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium ${
                index === 0
                  ? "bg-forest-600 text-cream-100"
                  : "text-forest-300"
              }`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="grid content-start gap-5 bg-cream-050 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-1">
              <span className="font-display text-2xl font-bold text-text-heading">
                {shell.heading}
              </span>
              <span className="text-sm text-text-muted">{shell.sub}</span>
            </div>
            <AIBadge size="sm" label="AI active" />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {shell.stats.map((stat) => (
              <div
                key={stat.label}
                className="grid gap-2 rounded-control border border-border-subtle bg-surface-card p-4"
              >
                <span
                  className="h-0.5 w-7 rounded-pill"
                  style={{ background: stat.rule }}
                />
                <span className="font-display text-[26px] font-extrabold tabular-nums text-text-heading">
                  {stat.value}
                </span>
                <span className="text-[13px] text-text-muted">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <div className="grid content-start gap-3 rounded-control border border-border-subtle bg-surface-card p-4.5">
              <span className="text-xs font-bold tracking-caps text-text-muted uppercase">
                {shell.listTitle}
              </span>
              {shell.rows.map((row) => (
                <div
                  key={row.title}
                  className="grid gap-2 border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-text-heading">
                      <Icon name={row.icon} size={16} />
                      {row.title}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-text-muted">
                      {row.meta}
                    </span>
                  </div>
                  <MiniProgressBar percent={row.percent} color={row.tone} />
                </div>
              ))}
            </div>

            <div className="grid content-start gap-3 rounded-control bg-surface-inverse p-4.5 text-cream-100">
              <AIBadge size="sm" label="Lurniva AI" dark />
              <span className="font-display text-[17px] font-bold leading-snug">
                {shell.aiTitle}
              </span>
              <span className="text-sm leading-relaxed text-forest-300">
                {shell.aiBody}
              </span>
              <span className="flex flex-wrap gap-2 pt-1">
                {shell.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-pill border border-cream-100/[0.22] px-2.5 py-1 text-xs font-semibold text-cream-100"
                  >
                    {chip}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
