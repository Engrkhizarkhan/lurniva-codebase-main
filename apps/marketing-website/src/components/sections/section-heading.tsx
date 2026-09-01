import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

export interface SectionHeadingProps {
  eyebrow: string;
  eyebrowClassName?: string;
  title: string;
  description?: string;
  dark?: boolean;
  maxWidth?: string;
  align?: "start" | "center";
  badge?: ReactNode;
}

/** The eyebrow / h2 / lede paragraph combo repeated at the top of every section. */
export function SectionHeading({
  eyebrow,
  eyebrowClassName = "text-ember-600",
  title,
  description,
  dark = false,
  maxWidth = "56ch",
  align = "start",
  badge,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={`grid gap-3 ${align === "center" ? "justify-items-center text-center" : ""}`}
      style={{ maxWidth }}
    >
      {badge}
      <span
        className={`text-xs font-bold tracking-caps uppercase ${dark ? "text-lime-500" : eyebrowClassName}`}
      >
        {eyebrow}
      </span>
      <h2
        className={`m-0 font-display text-3xl leading-tight font-extrabold tracking-tight text-wrap-pretty sm:text-4xl ${dark ? "text-cream-100" : "text-text-heading"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`m-0 text-lg leading-relaxed ${dark ? "text-forest-300" : "text-text-muted"}`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
