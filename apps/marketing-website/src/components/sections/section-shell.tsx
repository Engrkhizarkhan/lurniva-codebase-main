import type { ReactNode } from "react";

export interface SectionShellProps {
  id?: string;
  children: ReactNode;
  background?: string;
  dark?: boolean;
  gap?: string;
}

/** The `<section><div max-width wrapper></div></section>` scaffold every section shares. */
export function SectionShell({
  id,
  children,
  background = "bg-surface-canvas",
  dark = false,
  gap = "gap-10",
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`px-6 py-24 lg:px-8 ${background} ${dark ? "text-cream-100" : ""}`}
    >
      <div className={`mx-auto grid max-w-(--page-max) ${gap}`}>{children}</div>
    </section>
  );
}
