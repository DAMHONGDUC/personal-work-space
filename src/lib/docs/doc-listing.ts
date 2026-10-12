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
