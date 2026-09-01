import type { CSSProperties } from "react";
import type { BrandTone } from "../types";

/**
 * The design tints an icon well with the brand hue at 14% and draws the glyph
 * in the solid hue. Kept as literals (not `var(--color-*)`) because the tint
 * needs an alpha channel the token can't carry.
 */
const TONE_HEX: Record<BrandTone, string> = {
  forest: "#033824",
  teal: "#0e7c86",
  lime: "#d1f941",
  ember: "#ff7110",
  amber: "#ffaa39",
};

function tint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getToneColor(tone: BrandTone): string {
  return TONE_HEX[tone];
}

/** The 34px rounded icon well the design puts in front of every card title. */
export function getToneWellStyle(tone: BrandTone): CSSProperties {
  return {
    width: 34,
    height: 34,
    borderRadius: "var(--radius-md)",
    background: tint(TONE_HEX[tone], 0.14),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  };
}
