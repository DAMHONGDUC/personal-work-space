/**
 * Every URL this site owns, in one place.
 *
 * The site is split into top-level sections — `/apps` for the published apps,
 * `/docs` for the written guides, `/effects` for the video-editing library and
 * `/personal` for everything about the publisher — so moving any one of them is
 * a single edit here plus the matching folder under `src/app`.
 *
 * Paths carry no trailing slash; `trailingSlash: true` in next.config.ts adds it
 * on navigation. The few places that build an absolute URL by hand (sitemap,
 * canonical tags) append the slash themselves.
 */
export const routes = {
  home: "/",
  /** The app directory: search plus one card per app. */
  apps: "/apps",
  /** An app's own space. Today it only holds the policy, so it forwards there. */
  app: (slug: string) => `/apps/${slug}`,
  /** One app's privacy policy. */
  privacyPolicy: (slug: string) => `/apps/${slug}/privacy_policy`,
  /** The guide index: one card per doc, with its sections listed on it. */
  docs: "/docs",
  /** One guide, with its sections navigable from a table of contents. */
  doc: (slug: string) => `/docs/${slug}`,
  /** The effects library: categories, and a search over every file. */
  effects: "/effects",
  /** One category, its packs listed in turn with a preview for every file. */
  effectCategory: (id: string) => `/effects/${id}`,
  cv: "/personal/cv",
} as const;

/**
 * Slugs an app file may not use, because a static segment of the same name
 * already answers that URL and would shadow the app.
 */
export const RESERVED_SLUGS = ["apps", "docs", "effects", "personal"] as const;

/**
 * Prefix for plain `<a href>` and `<meta http-equiv="refresh">` targets.
 * `next/link` applies the base path itself; raw markup does not.
 */
export function withBasePath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
