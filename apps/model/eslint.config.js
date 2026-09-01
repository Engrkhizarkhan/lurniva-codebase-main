import { reactConfig } from "@lurniva/eslint-config/react";

export default [
  ...reactConfig,
  { ignores: ["src/routeTree.gen.ts"] },
];