import { createMiddleware } from "@tanstack/react-start";

const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

export const corsMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  result.response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  result.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  result.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return result;
});
