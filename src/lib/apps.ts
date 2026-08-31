import fs from "node:fs";
import path from "node:path";
import config from "@/data/site.json";
import { ResourceConstant } from "@/lib/resource-constant.mts";

// Re-exported so the policy pages keep importing it from here.
export { formatDate } from "@/lib/format";

export type Section = {
  id: string;
  title: string;
  body: string[];
  list?: string[];
};

export type DataCategory = {
  category: string;
  items: string[];
  purpose: string;
  /** Whether the data is linked to the user's identity (App Store nutrition-label wording). */
  linked: boolean;
};

export type Permission = {
  name: string;
  required: boolean;
  reason: string;
};

export type ThirdParty = {
  name: string;
  purpose: string;
  url: string;
};

/** The shape of one file in src/data/apps. The slug comes from the filename. */
export type AppData = {
  name: string;
  tagline: string;
  /** An emoji, or a path under public/ such as `/app_icons/<slug>.png`. */
  icon: string;
  accent: string;
  platforms: string[];
  effectiveDate: string;
  lastUpdated: string;
  contactEmail?: string;
  storeLinks?: { appStore?: string; playStore?: string };
  /** Opening prose, rendered above "At a glance". Optional. */
  overview?: string[];
  summary: string[];
  collects: DataCategory[];
  notCollected: string[];
  permissions: Permission[];
  thirdParties: ThirdParty[];
  sections?: Section[];
};

export type App = AppData & { slug: string };

export type Site = {
  publisher: string;
  url: string;
  contactEmail: string;
  description: string;
};

type Config = {
  site: Site;
  defaults: { sections: Section[] };
};

const { site: siteConfig, defaults } = config as Config;

export const site = siteConfig;

const appsDir = path.join(process.cwd(), ResourceConstant.APPS_DIR);

/**
 * Every .json file in src/data/apps, read fresh so adding a file is picked up by
 * a refresh in dev. This only ever runs at build time — every route is
 * prerendered — so there is nothing to cache.
 */
export function getApps(): App[] {
  return fs
    .readdirSync(appsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const slug = path.basename(file, ".json");
      const raw = fs.readFileSync(path.join(appsDir, file), "utf8");

      try {
        return { slug, ...(JSON.parse(raw) as AppData) };
      } catch (error) {
        throw new Error(
          `src/data/apps/${file} is not valid JSON: ${(error as Error).message}`,
        );
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getApp(slug: string): App | undefined {
  return getApps().find((app) => app.slug === slug);
}

/** Fills the {{app}}, {{publisher}} and {{email}} placeholders used in the shared sections. */
function fill(text: string, app: App): string {
  return text
    .replaceAll("{{app}}", app.name)
    .replaceAll("{{publisher}}", site.publisher)
    .replaceAll("{{email}}", app.contactEmail ?? site.contactEmail);
}

/**
 * Shared sections from `defaults`, with any app-specific section of the same id
 * replacing it in place. Sections with a new id are appended before "changes".
 */
export function getSections(app: App): Section[] {
  const overrides = new Map((app.sections ?? []).map((s) => [s.id, s]));
  const merged: Section[] = [];

  for (const section of defaults.sections) {
    const override = overrides.get(section.id);
    if (override) overrides.delete(section.id);
    merged.push(override ?? section);
  }

  // Extra app-only sections read best right after the app-specific data details,
  // so insert them before the boilerplate tail instead of at the very end.
  const tailStart = merged.findIndex((s) => s.id === "changes");
  const insertAt = tailStart === -1 ? merged.length : tailStart;
  merged.splice(insertAt, 0, ...overrides.values());

  return merged.map((section) => ({
    ...section,
    body: section.body.map((p) => fill(p, app)),
    list: section.list?.map((item) => fill(item, app)),
  }));
}

/** Overview paragraphs with the same placeholders as the shared sections filled in. */
export function getOverview(app: App): string[] {
  return (app.overview ?? []).map((paragraph) => fill(paragraph, app));
}

export function contactEmail(app: App): string {
  return app.contactEmail ?? site.contactEmail;
}
