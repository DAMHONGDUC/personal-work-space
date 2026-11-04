import { afterEach, describe, expect, it } from "vitest";
import {
  APPS_QUERY,
  CV_QUERY,
  DOCS_QUERY,
  EFFECTS_QUERY,
  RESERVED_SLUGS,
  routes,
  withBasePath,
} from "./routes";

describe("routes", () => {
  it("puts the apps, the guides and the CV under different top-level sections", () => {
    expect(routes.apps).toBe("/apps");
    expect(routes.docs).toBe("/docs");
    expect(routes.cv).toBe("/personal/cv");
  });

  it("keeps the portfolio beside the CV, in the personal section", () => {
    expect(routes.portfolio).toBe("/personal/portfolio");
    expect(routes.portfolio.split("/")[1]).toBe(routes.cv.split("/")[1]);
  });

  it("nests an app policy under that app's own path", () => {
    expect(routes.app("focus-timer")).toBe(`${routes.apps}/focus-timer`);
    expect(routes.privacyPolicy("focus-timer")).toBe(
      `${routes.app("focus-timer")}/privacy_policy`,
    );
  });

  it("nests a guide under the guides section", () => {
    expect(routes.doc("xcode-setup")).toBe(`${routes.docs}/xcode-setup`);
  });

  it("nests an effects category under the effects section", () => {
    expect(routes.effectCategory("transitions")).toBe(`${routes.effects}/transitions`);
  });

  it("carries no trailing slash, so appending one never doubles it", () => {
    for (const path of [
      routes.apps,
      routes.docs,
      routes.effects,
      routes.cv,
      routes.portfolio,
      routes.privacyPolicy("focus-timer"),
      routes.doc("xcode-setup"),
      routes.effectCategory("transitions"),
    ]) {
      expect(path).not.toMatch(/\/$/);
      expect(path).toMatch(/^\//);
    }
  });

  it("reserves the first segment of every section", () => {
    // An app slug matching one of these would be shadowed by the static route.
    const sections = [routes.apps, routes.docs, routes.effects, routes.portfolio, routes.cv].map(
      (path) => path.split("/")[1],
    );

    for (const section of sections) {
      expect([...RESERVED_SLUGS] as string[]).toContain(section);
    }
  });
});

describe("query names", () => {
  // Each page's filters, keyed by the page that reads them.
  const pages = {
    [routes.docs]: DOCS_QUERY,
    [routes.apps]: APPS_QUERY,
    [routes.effects]: EFFECTS_QUERY,
    [routes.cv]: CV_QUERY,
  };

  it("names every filter on the site", () => {
    expect(DOCS_QUERY).toEqual({ topic: "topic", search: "q", lang: "lang" });
    expect(APPS_QUERY).toEqual({ search: "q" });
    expect(EFFECTS_QUERY).toEqual({ search: "q", kind: "kind" });
    expect(CV_QUERY).toEqual({ tab: "tab", version: "version" });
  });

  it("calls every search box `q`, so a search link reads the same on any page", () => {
    for (const names of Object.values(pages)) {
      if ("search" in names) expect(names.search).toBe("q");
    }
  });

  it("gives each filter of a page its own parameter", () => {
    for (const names of Object.values(pages)) {
      const values = Object.values(names);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("uses short lower-case names that need no escaping", () => {
    for (const names of Object.values(pages)) {
      for (const name of Object.values(names)) {
        expect(name).toMatch(/^[a-z]+$/);
        expect(encodeURIComponent(name)).toBe(name);
      }
    }
  });
});

describe("withBasePath", () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = original;
  });

  it("is a no-op when the site is served from the root", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;

    expect(withBasePath("/cv.pdf")).toBe("/cv.pdf");
  });

  it("prefixes the base path GitHub Pages serves a project site from", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/personal-work-space";

    expect(withBasePath(routes.cv)).toBe("/personal-work-space/personal/cv");
  });
});
