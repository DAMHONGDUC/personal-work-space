import { describe, expect, it } from "vitest";
import type { SeriesPage } from "@/lib/docs/doc-model";
import { groupHolds, seriesPanels } from "@/lib/docs/series-tree";

function page(slug: string, extra: Partial<SeriesPage> = {}): SeriesPage {
  return { slug, part: 0, title: { en: slug, vi: slug }, ...extra };
}

describe("seriesPanels", () => {
  it("keeps a series with no panels or groups as one block of loose pages", () => {
    const panels = seriesPanels([page("a"), page("b")]);

    expect(panels).toEqual([{ name: undefined, items: [{ page: page("a") }, { page: page("b") }] }]);
  });

  it("splits the pages into panels in reading order", () => {
    const panels = seriesPanels([
      page("readme", { panel: "Base docs" }),
      page("roadmap", { panel: "Base docs" }),
      page("f00", { panel: "Sprint guides" }),
    ]);

    expect(panels.map((panel) => panel.name)).toEqual(["Base docs", "Sprint guides"]);
    expect(panels[0].items).toHaveLength(2);
  });

  it("heads each group with the page that opens it", () => {
    const [panel] = seriesPanels([
      page("s0", { panel: "Sprint guides", group: "S0", opensGroup: true }),
      page("f00", { panel: "Sprint guides", group: "S0" }),
      page("f01", { panel: "Sprint guides", group: "S0" }),
      page("s1", { panel: "Sprint guides", group: "S1", opensGroup: true }),
      page("f02", { panel: "Sprint guides", group: "S1" }),
    ]);

    const groups = panel.items.map((item) => ("group" in item ? item.group : null));
    expect(groups.map((group) => group?.head?.slug)).toEqual(["s0", "s1"]);
    expect(groups.map((group) => group?.pages.map((entry) => entry.slug))).toEqual([["f00", "f01"], ["f02"]]);
  });

  it("leaves a group without an overview headless", () => {
    const [panel] = seriesPanels([page("intro"), page("a", { group: "Build guide" }), page("b", { group: "Build guide" })]);

    expect(panel.items).toHaveLength(2);
    expect(panel.items[1]).toEqual({ group: { name: "Build guide", pages: [page("a", { group: "Build guide" }), page("b", { group: "Build guide" })] } });
  });
});

describe("groupHolds", () => {
  const group = { name: "S0", head: page("s0"), pages: [page("f00")] };

  it("finds the head and the pages under it", () => {
    expect(groupHolds(group, "s0")).toBe(true);
    expect(groupHolds(group, "f00")).toBe(true);
    expect(groupHolds(group, "f01")).toBe(false);
  });
});
