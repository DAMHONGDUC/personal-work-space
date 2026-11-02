import type { SeriesPage } from "@/lib/docs/doc-model";

/** Pages under one heading. `head` is the group's own overview, when it has one. */
export type SeriesGroup = { name: string; head?: SeriesPage; pages: SeriesPage[] };
export type SeriesItem = { page: SeriesPage } | { group: SeriesGroup };
/** One block of the series navigation; a series with no panels is one unnamed block. */
export type SeriesPanel = { name?: string; items: SeriesItem[] };

/**
 * A series' pages, in reading order, as its navigation draws them: split into
 * panels, and within a panel into loose pages and groups. A run of pages with
 * the same panel or group is one block; the page that opens a group heads it.
 */
export function seriesPanels(pages: SeriesPage[]): SeriesPanel[] {
  const panels: SeriesPanel[] = [];

  for (const page of pages) {
    let panel = panels.at(-1);
    if (!panel || panel.name !== page.panel) {
      panel = { name: page.panel, items: [] };
      panels.push(panel);
    }
    if (!page.group) {
      panel.items.push({ page });
      continue;
    }

    const last = panel.items.at(-1);
    let group = last && "group" in last && last.group.name === page.group ? last.group : undefined;
    if (!group) {
      group = { name: page.group, pages: [] };
      panel.items.push({ group });
    }
    if (page.opensGroup) group.head = page;
    else group.pages.push(page);
  }

  return panels;
}

/** Whether a group holds the page with this slug, its head included. */
export function groupHolds(group: SeriesGroup, slug: string): boolean {
  return group.head?.slug === slug || group.pages.some((page) => page.slug === slug);
}
