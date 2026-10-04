// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves the site under the /trade-companion/ subpath, so all
// built asset URLs (CSS/JS/fonts) must be prefixed with that base. The
// workflow sets GITHUB_PAGES=true; local dev and Lovable preview stay at "/".
const base = process.env["GITHUB_PAGES"] === "true" ? "/trade-companion/" : "/";

export default defineConfig({
  vite: { base },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Prerender public routes to static HTML so the build output is a fully
    // static site (index.html at the root) suitable for GitHub Pages.
    pages: [{ path: "/" }, { path: "/auth" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
