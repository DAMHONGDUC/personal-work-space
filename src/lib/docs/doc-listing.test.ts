import { describe, expect, it } from "vitest";
import type { Doc } from "@/lib/docs/doc-model";
import { isListed, panelShortcuts, seriesSizes } from "@/lib/docs/doc-listing";

function doc(slug: string, series?: Doc["series"]): Doc {
  return {
    slug,
    title: slug,
    tagline: "",
    icon: "🛠️",
    topic: "ios",
    tags: [],
    readingTime: "1 min",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01",
    intro: [],
    sections: [],
    series,
  };
}

const docs = [
  doc("ssh-git"),
  doc("sitelog-roadmap", { id: "sitelog", part: 0 }),
  doc("sitelog-specs-00-overview", { id: "sitelog", part: 1, group: "Feature specs" }),
  doc("sitelog-guide-00-foundation", { id: "sitelog", part: 2, group: "Build guide" }),
];

describe("isListed", () => {
  it("lists standalone guides and the first page of a series, not the rest", () => {
    expect(docs.filter(isListed).map((entry) => entry.slug)).toEqual(["ssh-git", "sitelog-roadmap"]);
  });
});

describe("seriesSizes", () => {
  it("counts every page of each series", () => {
    expect(seriesSizes(docs)).toEqual(new Map([["sitelog", 3]]));
  });
});

describe("panelShortcuts", () => {
  it("offers the first page of each panel past the one the series opens in", () => {
    const panelled = [
      doc("sitelog-overview", { id: "sitelog", part: 0, panel: "Base docs" }),
      doc("sitelog-roadmap", { id: "sitelog", part: 1, panel: "Base docs" }),
      doc("sitelog-guide-s0", { id: "sitelog", part: 2, panel: "Sprint guides", group: "S0", opensGroup: true }),
      doc("sitelog-guide-f00", { id: "sitelog", part: 3, panel: "Sprint guides", group: "S0" }),
    ].reverse();

    expect(panelShortcuts(panelled)).toEqual(
      new Map([["sitelog", [{ name: "Sprint guides", slug: "sitelog-guide-s0" }]]]),
    );
  });

  it("offers nothing for a series without panels", () => {
    expect(panelShortcuts(docs)).toEqual(new Map());
  });
});
