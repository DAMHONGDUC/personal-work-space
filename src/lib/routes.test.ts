import { afterEach, describe, expect, it } from "vitest";
import { RESERVED_SLUGS, routes, withBasePath } from "./routes";

describe("routes", () => {
  it("puts the apps, the guides and the CV under different top-level sections", () => {
    expect(routes.apps).toBe("/apps");
    expect(routes.docs).toBe("/docs");
    expect(routes.cv).toBe("/personal/cv");
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
    const sections = [routes.apps, routes.docs, routes.effects, routes.cv].map(
      (path) => path.split("/")[1],
    );

    for (const section of sections) {
      expect([...RESERVED_SLUGS] as string[]).toContain(section);
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
    process.env.NEXT_PUBLIC_BASE_PATH = "/personal_work_space";

    expect(withBasePath(routes.cv)).toBe("/personal_work_space/personal/cv");
  });
});
