import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { apiAuthMiddleware } from "~/middleware/auth";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, apiAuthMiddleware],
}));
