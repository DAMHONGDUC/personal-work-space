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

/** The page a link to a panel opens: its first page, or its first group's. */
export function panelStart(panel: SeriesPanel): SeriesPage {
  const first = panel.items[0];
  return "page" in first ? first.page : (first.group.head ?? first.group.pages[0]);
}

/** One step of a page's breadcrumb: a page, under its own title or a panel's name. */
export type SeriesCrumb = { page: SeriesPage; label?: string };

/**
 * Where a page sits in its series, from the top down, the page itself last:
 * the series' first page, then the panel the page is in when it is not the
 * first one (opening at the panel's first page), then the group's own page.
 * A SiteLog feature guide reads SiteLog / iOS sprint guides / S1 / F02.
 */
export function seriesTrail(pages: SeriesPage[], current: string): SeriesCrumb[] {
  const page = pages.find((entry) => entry.slug === current);
  if (!page) return [];

  const trail: SeriesCrumb[] = [];
  if (pages[0].slug !== current) trail.push({ page: pages[0] });

  const panels = seriesPanels(pages);
  const position = panels.findIndex((panel) =>
    panel.items.some((item) => ("page" in item ? item.page.slug === current : groupHolds(item.group, current))),
  );
  if (position > 0 && panels[position].name) {
    trail.push({ page: panelStart(panels[position]), label: panels[position].name });
  }

  const group = panels[position]?.items.find(
    (item): item is { group: SeriesGroup } => "group" in item && groupHolds(item.group, current),
  )?.group;
  if (group?.head && group.head.slug !== current) trail.push({ page: group.head });

  return [...trail, { page }];
}
