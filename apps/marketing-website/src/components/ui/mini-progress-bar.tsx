export interface MiniProgressBarProps {
  percent: number;
  color: string;
  trackClassName?: string;
  height?: number;
}

/**
 * A thin, arbitrarily-tinted progress track used across the product mocks
 * (platform tour, planner, examiner, institutes) where the fill color is a
 * design token passed at the call site rather than one of the semantic
 * success/warning/error tones `@lurniva/ui`'s ProgressBar exposes.
 */
export function MiniProgressBar({
  percent,
  color,
  trackClassName = "bg-surface-sunken",
  height = 6,
}: MiniProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <span
      style={{ height }}
      className={`block overflow-hidden rounded-pill ${trackClassName}`}
    >
      <span
        style={{ width: `${clamped}%`, height, background: color }}
        className="block rounded-pill"
      />
    </span>
  );
}
