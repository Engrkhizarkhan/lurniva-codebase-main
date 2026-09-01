import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { cssVariablesResolver, theme } from "./theme.js";

export interface UiProviderProps {
  children: ReactNode;
}

/**
 * tokens.css's [data-theme="dark"] block is currently identical to "light"
 * (dark mode is scaffolded but not yet authored), so Mantine's own color
 * scheme is forced to light rather than left to auto-detect — avoids a
 * silent mismatch where Mantine flips to dark off OS preference while our
 * own tokens haven't diverged yet. Revisit once real dark values exist.
 */
export function UiProvider({ children }: UiProviderProps) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
      forceColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}
