/**
 * Which guides the index shows before anything is typed.
 *
 * A series is listed once, by its first page — the root that names it and
 * links the rest — so a 24-page series reads as one entry rather than burying
 * the shelf. A search still reaches every page, since a term may live on any
 * of them.
 */
import type { Doc } from "@/lib/docs/doc-model";

/** Every standalone guide, and part 0 of each series. */
export function isListed(doc: Doc): boolean {
  return doc.series === undefined || doc.series.part === 0;
}

/** The number of pages in each series, by series id. */
export function seriesSizes(docs: Doc[]): Map<string, number> {
  const sizes = new Map<string, number>();

  for (const doc of docs) {
    if (doc.series) sizes.set(doc.series.id, (sizes.get(doc.series.id) ?? 0) + 1);
  }

  return sizes;
}

/** A shortcut from a series' card into one of its panels. */
export type PanelShortcut = { name: string; slug: string };

/**
 * Where each panel of a series starts, past the one its first page opens, by
 * series id: the card that lists the series offers them as shortcuts, so the
 * step-by-step guides are one click away without going through the base docs.
 */
export function panelShortcuts(docs: Doc[]): Map<string, PanelShortcut[]> {
  const shortcuts = new Map<string, PanelShortcut[]>();
  const ordered = docs.filter((doc) => doc.series).sort((a, b) => a.series!.part - b.series!.part);

  for (const doc of ordered) {
    const { id, part, panel } = doc.series!;
    const known = shortcuts.get(id) ?? [];
    if (part === 0) {
      shortcuts.set(id, known);
      continue;
    }
    const opening = ordered.find((entry) => entry.series!.id === id && entry.series!.part === 0)?.series!.panel;
    if (panel && panel !== opening && !known.some((entry) => entry.name === panel)) {
      shortcuts.set(id, [...known, { name: panel, slug: doc.slug }]);
    }
  }

  return new Map([...shortcuts].filter(([, list]) => list.length > 0));
}
