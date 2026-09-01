"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only usable from a Client Component, hence this thin
// wrapper — the actual cursor never needs to (and can't safely) render on
// the server, since it reads matchMedia synchronously on mount.
const CustomCursor = dynamic(
  () => import("./custom-cursor").then((mod) => mod.CustomCursor),
  { ssr: false },
);

export function CustomCursorLoader() {
  return <CustomCursor />;
}
