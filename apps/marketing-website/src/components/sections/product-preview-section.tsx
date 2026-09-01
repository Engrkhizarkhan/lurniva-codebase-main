import { Reveal } from "@/components/motion/reveal";
import { ProductShellMock } from "@/components/sections/product-shell-mock";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { shells } from "@/lib/data/shells";
import type { Seat } from "@/lib/data/shells";

export interface ProductPreviewSectionProps {
  seat: Seat;
  eyebrow: string;
  eyebrowClassName?: string;
  title: string;
  description?: string;
  background?: string;
}

/** A single fixed-seat product mock — the one-audience-per-page replacement for the old multi-tab `PlatformTour`. */
export function ProductPreviewSection({
  seat,
  eyebrow,
  eyebrowClassName,
  title,
  description,
  background = "bg-surface-sunken",
}: ProductPreviewSectionProps) {
  return (
    <SectionShell background={background}>
      <SectionHeading
        eyebrow={eyebrow}
        eyebrowClassName={eyebrowClassName}
        title={title}
        description={description}
      />
      <Reveal delay={0.1} distance={12}>
        <ProductShellMock shell={shells[seat]} />
      </Reveal>
    </SectionShell>
  );
}
