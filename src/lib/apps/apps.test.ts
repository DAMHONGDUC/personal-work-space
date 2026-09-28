import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ResourceConstant } from "@/lib/resource-constant.mts";
import {
  contactEmail,
  formatDate,
  getApp,
  getApps,
  getOverview,
  getSections,
  site,
  type App,
} from "./apps";

/** A complete app that tests can shallow-override, so cases stay readable. */
function makeApp(overrides: Partial<App> = {}): App {
  return {
    slug: "test-app",
    name: "Test App",
    tagline: "A tagline.",
    icon: "🧪",
    accent: "#6366f1",
    platforms: ["iOS"],
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01",
    summary: ["A point."],
    collects: [],
    notCollected: [],
    permissions: [],
    thirdParties: [],
    ...overrides,
  };
}

describe("getApps", () => {
  it("derives the slug from the filename", () => {
    const apps = getApps();

    expect(apps.length).toBeGreaterThan(0);
    for (const app of apps) {
      expect(app.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("returns apps sorted by name", () => {
    const names = getApps().map((app) => app.name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("gives every app a unique slug", () => {
    const slugs = getApps().map((app) => app.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("picks up a new file without any registration", () => {
    // Guards the whole point of the directory loader: getApps reads the folder
    // rather than a hardcoded list, so the slugs it returns are exactly the
    // filenames on disk — add a file and it appears, with nothing to register.
    const onDisk = fs
      .readdirSync(path.join(process.cwd(), ResourceConstant.APPS_DIR))
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.basename(file, ".json"))
      .sort();

    expect(getApps().map((app) => app.slug).sort()).toEqual(onDisk);
  });
});

describe("getApp", () => {
  it("finds an app by slug", () => {
    const [first] = getApps();

    expect(getApp(first.slug)?.slug).toBe(first.slug);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getApp("does-not-exist")).toBeUndefined();
  });
});

describe("getSections", () => {
  it("returns the shared sections when the app defines none", () => {
    const ids = getSections(makeApp()).map((section) => section.id);

    expect(ids).toContain("who-we-are");
    expect(ids).toContain("contact");
  });

  it("replaces a shared section when the app reuses its id", () => {
    const sections = getSections(
      makeApp({
        sections: [
          { id: "security", title: "Custom security", body: ["Replaced."] },
        ],
      }),
    );

    const security = sections.filter((section) => section.id === "security");

    expect(security).toHaveLength(1);
    expect(security[0].title).toBe("Custom security");
    expect(security[0].body).toEqual(["Replaced."]);
  });

  it("keeps a replaced section in its original position", () => {
    const base = getSections(makeApp()).map((section) => section.id);
    const withOverride = getSections(
      makeApp({
        sections: [{ id: "security", title: "Custom", body: ["x"] }],
      }),
    ).map((section) => section.id);

    expect(withOverride).toEqual(base);
  });

  it("appends a new section before the boilerplate tail", () => {
    const ids = getSections(
      makeApp({
        sections: [{ id: "extra", title: "Extra", body: ["x"] }],
      }),
    ).map((section) => section.id);

    expect(ids).toContain("extra");
    expect(ids.indexOf("extra")).toBeLessThan(ids.indexOf("changes"));
    expect(ids.indexOf("extra")).toBeLessThan(ids.indexOf("contact"));
  });

  it("substitutes placeholders in body and list text", () => {
    const [section] = getSections(
      makeApp({
        name: "Widget",
        contactEmail: "hi@example.com",
        sections: [
          {
            id: "who-we-are",
            title: "Who",
            body: ["{{app}} by {{publisher}}."],
            list: ["Mail {{email}}."],
          },
        ],
      }),
    );

    expect(section.body[0]).toBe(`Widget by ${site.publisher}.`);
    expect(section.list?.[0]).toBe("Mail hi@example.com.");
  });

  it("leaves no unsubstituted placeholders in any shared section", () => {
    for (const app of getApps()) {
      for (const section of getSections(app)) {
        for (const text of [...section.body, ...(section.list ?? [])]) {
          expect(text).not.toMatch(/\{\{\w+\}\}/);
        }
      }
    }
  });
});

describe("getOverview", () => {
  it("is empty when the app has no overview", () => {
    expect(getOverview(makeApp())).toEqual([]);
  });

  it("substitutes placeholders", () => {
    const overview = getOverview(
      makeApp({ name: "Widget", overview: ["About {{app}}."] }),
    );

    expect(overview).toEqual(["About Widget."]);
  });
});

describe("contactEmail", () => {
  it("prefers the app's own address", () => {
    expect(contactEmail(makeApp({ contactEmail: "app@example.com" }))).toBe(
      "app@example.com",
    );
  });

  it("falls back to the site address", () => {
    expect(contactEmail(makeApp())).toBe(site.contactEmail);
  });
});

describe("formatDate", () => {
  it("formats an ISO date without shifting across time zones", () => {
    // A UTC-midnight date can slip to the previous day under a negative offset
    // if it is parsed as local time.
    expect(formatDate("2026-01-01")).toBe("1 January 2026");
    expect(formatDate("2026-12-31")).toBe("31 December 2026");
  });
});
