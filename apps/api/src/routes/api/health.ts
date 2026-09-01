import { createFileRoute } from "@tanstack/react-router";
import { corsMiddleware } from "~/middleware/cors";

export const Route = createFileRoute("/api/health")({
  server: {
    middleware: [corsMiddleware],
    handlers: {
      GET: () => Response.json({ status: "ok" }),
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
