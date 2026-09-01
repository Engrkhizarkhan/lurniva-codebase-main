import { createFileRoute } from "@tanstack/react-router";
import { isModelConfigured } from "~/server/config/env";
import { ok } from "~/lib/response";

export const Route = createFileRoute("/api/model/handshake")({
  server: {
    handlers: {
      GET: () => {
        const configured = isModelConfigured();
        return ok({
          configured,
          modelName: configured ? (process.env.MODEL_NAME ?? "") : null,
          baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
          message: configured
            ? "The model service is ready."
            : "Add OPENAI_API_KEY and MODEL_NAME to your .env to enable real model responses.",
        });
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
