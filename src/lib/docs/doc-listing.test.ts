import { describe, expect, it } from "vitest";
import type { Doc } from "@/lib/docs/doc-model";
import { isListed, seriesSizes } from "@/lib/docs/doc-listing";

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
