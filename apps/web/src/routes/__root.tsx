/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiProvider } from "@lurniva/ui/mantine";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";

function useSuppressViewTransitionRejections() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      if (
        event.reason instanceof DOMException &&
        event.reason.name === "InvalidStateError"
      ) {
        event.preventDefault();
      }
    }
    window.addEventListener("unhandledrejection", handleRejection);
    return () =>
      window.removeEventListener("unhandledrejection", handleRejection);
  }, []);
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lurniva" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  useSuppressViewTransitionRejections();
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="h-screen overflow-hidden">
        <UiProvider>
          <div className="h-full overflow-y-auto">{children}</div>
          <TanStackRouterDevtools position="bottom-right" />
        </UiProvider>
        <Scripts />
      </body>
    </html>
  );
}
