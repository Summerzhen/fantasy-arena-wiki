import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales.
 *
 * To add a new language you must update THREE places that have to stay in sync:
 *   1. The `locales` array below.
 *   2. The static imports + `messagesMap` in `src/i18n/request.ts`.
 *   3. The matching JSON file in `src/locales/<locale>.json`.
 */
export const routing = defineRouting({
  locales: ["en", "ja", "pt-br", "es", "vi"],
  defaultLocale: "en",
  // Every locale is served with an explicit prefix for consistent SEO routing.
  localePrefix: "always",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
