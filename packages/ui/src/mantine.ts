// Split out from the main "@lurniva/ui" barrel: this pulls in @mantine/core,
// which only apps/web (a Mantine-based app) needs. A pure Tailwind consumer
// like the Next.js marketing site should never have Mantine enter its
// module graph just for importing Button/Icon/etc — import from here
// explicitly instead ("@lurniva/ui/mantine") wherever UiProvider is needed.
export * from "./provider.js";
export * from "./theme.js";
