import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getApps, site } from "@/lib/apps/apps";
import { RESERVED_SLUGS } from "@/lib/routes/routes";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const appsDir = path.join(process.cwd(), ResourceConstant.APPS_DIR);

const ALLOWED_KEYS = new Set([
  "name",
  "tagline",
  "icon",
  "accent",
  "platforms",
  "effectiveDate",
  "lastUpdated",
  "contactEmail",
  "storeLinks",
  "overview",
  "summary",
  "collects",
  "notCollected",
  "permissions",
  "thirdParties",
  "sections",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const apps = getApps();

describe("site.json", () => {
  it("has an absolute https url with no trailing slash", () => {
    // The sitemap and canonical tags concatenate onto this, so a trailing
    // slash would produce doubled separators.
    expect(site.url).toMatch(/^https:\/\//);
    expect(site.url).not.toMatch(/\/$/);
  });

  it("has a publisher and a contact address", () => {
    expect(site.publisher.trim()).not.toBe("");
    expect(site.contactEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("does not still point at the placeholder domain", () => {
    expect(site.url).not.toContain("example.com");
  });
});

describe("app files", () => {
  it("contains only .json files", () => {
    const unexpected = fs
      .readdirSync(appsDir)
      .filter((file) => !file.endsWith(".json"));

    expect(unexpected).toEqual([]);
  });

  it("loads at least one app", () => {
    expect(apps.length).toBeGreaterThan(0);
  });
});

describe.each(apps.map((app) => [app.slug, app] as const))("%s", (slug, app) => {
  it("uses only known fields", () => {
    const unknown = Object.keys(app).filter(
      (key) => key !== "slug" && !ALLOWED_KEYS.has(key),
    );

    expect(unknown).toEqual([]);
  });

  it("has a url-safe slug", () => {
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("does not use a slug reserved by a top-level section", () => {
    // The legacy /<slug>/ redirect lives at the site root, where a static
    // segment of the same name wins — the app would become unreachable there.
    expect([...RESERVED_SLUGS] as string[]).not.toContain(slug);
  });

  it("has non-empty text fields", () => {
    expect(app.name.trim()).not.toBe("");
    expect(app.tagline.trim()).not.toBe("");
    expect(app.icon.trim()).not.toBe("");
  });

  it("ships the file behind an icon path", () => {
    // An icon is either an emoji or a path under public/. A path that resolves
    // to nothing is a broken image on the card and the policy hero at once, and
    // a static export has no server to notice it.
    if (!app.icon.startsWith("/")) return;

    const file = path.join(
      process.cwd(),
      ResourceConstant.PUBLIC_DIR,
      app.icon,
    );

    expect(fs.existsSync(file), `${app.icon} is not in public/`).toBe(true);
  });

  it("has a hex accent colour", () => {
    expect(app.accent).toMatch(HEX_COLOR);
  });

  it("lists at least one platform and one summary point", () => {
    expect(app.platforms.length).toBeGreaterThan(0);
    expect(app.summary.length).toBeGreaterThan(0);
  });

  it("has valid dates that are not in the wrong order", () => {
    expect(app.effectiveDate).toMatch(ISO_DATE);
    expect(app.lastUpdated).toMatch(ISO_DATE);

    expect(Number.isNaN(Date.parse(app.effectiveDate))).toBe(false);
    expect(Number.isNaN(Date.parse(app.lastUpdated))).toBe(false);

    expect(Date.parse(app.lastUpdated)).toBeGreaterThanOrEqual(
      Date.parse(app.effectiveDate),
    );
  });

  it("declares linked as a boolean on every collected category", () => {
    for (const entry of app.collects) {
      // A string "true" renders as "Linked to you" regardless of value, so the
      // badge would silently lie.
      expect(typeof entry.linked).toBe("boolean");
      expect(entry.category.trim()).not.toBe("");
      expect(entry.purpose.trim()).not.toBe("");
      expect(entry.items.length).toBeGreaterThan(0);
    }
  });

  it("declares required as a boolean on every permission", () => {
    for (const permission of app.permissions) {
      expect(typeof permission.required).toBe("boolean");
      expect(permission.name.trim()).not.toBe("");
      expect(permission.reason.trim()).not.toBe("");
    }
  });

  it("links every third party to an https policy", () => {
    for (const party of app.thirdParties) {
      expect(party.name.trim()).not.toBe("");
      expect(party.purpose.trim()).not.toBe("");
      expect(party.url).toMatch(/^https:\/\//);
    }
  });

  it("uses https for any store link", () => {
    for (const url of Object.values(app.storeLinks ?? {})) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("has no placeholder store links left from the template", () => {
    // A template id left in place ships a policy whose store button points at
    // an app that does not exist.
    for (const url of Object.values(app.storeLinks ?? {})) {
      expect(url).not.toMatch(/id0+$/);
      expect(url).not.toContain("com.example.");
    }
  });

  it("has unique, non-empty custom sections", () => {
    const ids = (app.sections ?? []).map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);

    for (const section of app.sections ?? []) {
      expect(section.title.trim()).not.toBe("");
      expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it("has a contact address if it overrides the site one", () => {
    if (app.contactEmail !== undefined) {
      expect(app.contactEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    }
  });
});
