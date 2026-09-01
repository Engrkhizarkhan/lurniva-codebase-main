import { createStart } from "@tanstack/react-start";

/** Lightweight server instance for the model app. No auth/DB wiring needed —
 * it's a standalone AI structuring + generation service inside the monorepo. */
export const startInstance = createStart(() => ({
  requestMiddleware: [],
}));
