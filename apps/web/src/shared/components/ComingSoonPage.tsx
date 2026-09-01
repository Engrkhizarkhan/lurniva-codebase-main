export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-card border border-border-subtle bg-surface-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-text-heading">
        {title}
      </h1>
      <p className="text-sm text-text-muted">This page is coming soon.</p>
    </div>
  );
}
