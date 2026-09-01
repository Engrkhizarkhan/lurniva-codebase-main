export function StepLabel({ children }: { children: string }) {
  return (
    <span className="text-[11px] font-bold tracking-caps text-text-muted uppercase">
      {children}
    </span>
  );
}
