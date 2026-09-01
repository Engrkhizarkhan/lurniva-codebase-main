const WIDTHS = [100, 92, 96, 60];

export function DocumentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {WIDTHS.map((width, index) => (
        <div
          key={index}
          className="h-3.5 animate-pulse rounded-full bg-surface-sunken"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}
