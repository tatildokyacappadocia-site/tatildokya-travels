import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel";

export default defineConfig({
  i18n: {
    locales: ["en", "tr", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
    },
  },

  // Inline all page CSS directly into the HTML instead of Astro's default
  // (only inlining stylesheets under ~4KB, extracting everything larger into
  // a separate render-blocking <link rel="stylesheet"> file). Each page's
  // styles here are page-specific rather than shared across many routes, so
  // the browser-caching benefit of an external file is minimal anyway — but
  // the extra network round-trip that external file costs on a slow mobile
  // connection is real and was showing up directly in PageSpeed's First
  // Contentful Paint / Largest Contentful Paint numbers.
  build: {
    inlineStylesheets: "always",
  },

  adapter: vercel(),
});