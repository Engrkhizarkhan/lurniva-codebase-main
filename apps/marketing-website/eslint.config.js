// @ts-check
import { reactConfig } from "@lurniva/eslint-config/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: [".next/**", "next-env.d.ts"] },
  ...reactConfig,
];
