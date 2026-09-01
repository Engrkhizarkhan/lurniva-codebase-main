import { createTheme } from "@mantine/core";
import type { CSSVariablesResolver } from "@mantine/core";

/**
 * Our colors are not static hex values — they're `var(--token)` references that
 * resolve through `[data-theme]` in tokens.css. `theme.colors`/`primaryColor`
 * require static shades, so this resolver bypasses that system entirely and
 * points Mantine's own CSS variables straight at our existing tokens instead.
 * Individual components additionally render `unstyled` and reapply their own
 * Tailwind class lookup tables — this resolver is only the fallback layer for
 * anything not explicitly overridden per-component.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--mantine-color-white": "var(--text-on-primary)",
    "--mantine-color-black": "var(--color-ink-900)",
    "--mantine-font-family": "var(--font-body)",
    "--mantine-font-family-headings": "var(--font-display)",
    "--mantine-font-family-monospace": "var(--font-mono)",
    "--mantine-line-height": "var(--lh-body)",
    "--mantine-radius-default": "var(--radius-control)",
    "--mantine-primary-color-filled": "var(--primary)",
    "--mantine-primary-color-filled-hover": "var(--primary-hover)",
    "--mantine-primary-color-light": "var(--primary-soft)",
    "--mantine-primary-color-light-hover": "var(--primary-soft)",
    "--mantine-primary-color-light-color": "var(--primary)",
    "--mantine-radius-xs": "var(--radius-xs)",
    "--mantine-radius-sm": "var(--radius-sm)",
    "--mantine-radius-md": "var(--radius-md)",
    "--mantine-radius-lg": "var(--radius-lg)",
    "--mantine-radius-xl": "var(--radius-xl)",
    "--mantine-shadow-xs": "var(--shadow-xs)",
    "--mantine-shadow-sm": "var(--shadow-sm)",
    "--mantine-shadow-md": "var(--shadow-md)",
    "--mantine-shadow-lg": "var(--shadow-lg)",
    "--mantine-shadow-xl": "var(--shadow-modal)",
    "--mantine-spacing-xs": "var(--space-2)",
    "--mantine-spacing-sm": "var(--space-3)",
    "--mantine-spacing-md": "var(--space-4)",
    "--mantine-spacing-lg": "var(--space-6)",
    "--mantine-spacing-xl": "var(--space-8)",
  },
  light: {
    "--mantine-color-text": "var(--text-body)",
    "--mantine-color-body": "var(--surface-canvas)",
    "--mantine-color-error": "var(--error)",
    "--mantine-color-success": "var(--success)",
    "--mantine-color-placeholder": "var(--text-faint)",
    "--mantine-color-anchor": "var(--text-link)",
    "--mantine-color-default": "var(--surface-raised)",
    "--mantine-color-default-hover": "var(--surface-subtle)",
    "--mantine-color-default-color": "var(--text-body)",
    "--mantine-color-default-border": "var(--border-default)",
    "--mantine-color-dimmed": "var(--text-muted)",
    "--mantine-color-disabled": "var(--surface-subtle)",
    "--mantine-color-disabled-color": "var(--text-faint)",
    "--mantine-color-disabled-border": "var(--border-subtle)",
  },
  // tokens.css's [data-theme="dark"] block is currently identical to "light"
  // (dark mode is scaffolded but not yet authored) — mirrored here to match,
  // and irrelevant while UiProvider forces the light scheme regardless.
  dark: {
    "--mantine-color-text": "var(--text-body)",
    "--mantine-color-body": "var(--surface-canvas)",
    "--mantine-color-error": "var(--error)",
    "--mantine-color-success": "var(--success)",
    "--mantine-color-placeholder": "var(--text-faint)",
    "--mantine-color-anchor": "var(--text-link)",
    "--mantine-color-default": "var(--surface-raised)",
    "--mantine-color-default-hover": "var(--surface-subtle)",
    "--mantine-color-default-color": "var(--text-body)",
    "--mantine-color-default-border": "var(--border-default)",
    "--mantine-color-dimmed": "var(--text-muted)",
    "--mantine-color-disabled": "var(--surface-subtle)",
    "--mantine-color-disabled-color": "var(--text-faint)",
    "--mantine-color-disabled-border": "var(--border-subtle)",
  },
});

export const theme = createTheme({
  fontFamily: "var(--font-body)",
  fontFamilyMonospace: "var(--font-mono)",
  headings: {
    fontFamily: "var(--font-display)",
  },
  defaultRadius: "md",
  radius: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
  },
  spacing: {
    xs: "var(--space-2)",
    sm: "var(--space-3)",
    md: "var(--space-4)",
    lg: "var(--space-6)",
    xl: "var(--space-8)",
  },
  shadows: {
    xs: "var(--shadow-xs)",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-modal)",
  },
  // Components already apply their own focus-visible:outline-2 outline-border-focus classes.
  focusRing: "never",
});
