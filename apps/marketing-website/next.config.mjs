/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // @lurniva/ui is a workspace package resolved straight from its .ts/.tsx
  // source (no build step) — Next only runs its TS/JSX loader chain on
  // node_modules packages that are explicitly opted in here.
  transpilePackages: ["@lurniva/ui"],
  webpack: (config) => {
    // @lurniva/ui's source imports use the TS-style "./button.js" specifier
    // for a "./button.tsx" file (standard under `moduleResolution: Bundler`,
    // and what Vite/esbuild already resolve for apps/web) — webpack doesn't
    // do that remap by default, so it's opted in here for this app only.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
