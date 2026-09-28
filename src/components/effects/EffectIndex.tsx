"use client";

import { useMemo, useState } from "react";
import { CategoryCard, type CategorySummary } from "@/components/effects/CategoryCard";
import { EffectFilters } from "@/components/effects/EffectFilters";
import { EffectGrid } from "@/components/effects/EffectGrid";
import { EffectPreview } from "@/components/effects/EffectPreview";
import { EffectTree } from "@/components/effects/EffectTree";
import { FilterPanel } from "@/components/effects/FilterPanel";
import { useEffectUploads } from "@/hooks/effects/useEffectUploads";
import {
  EFFECT_KINDS,
  type EffectEntry,
  type EffectKind,
  type EffectTreeCategory,
} from "@/lib/effects/effect-model";
import { searchEffects } from "@/lib/effects/effect-search";
import { treeWithUploads, uploadedEntries } from "@/lib/effects/effect-uploads";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * Past this many hits the grid is too long to scan, and each tile is an image
 * request to Drive, so the rest wait for a sharper query.
 */
const RESULT_LIMIT = 120;

/**
 * The library's front page. With nothing typed it shows the categories; a
 * query or a kind turns it into one grid of matches from every pack at once.
 */
export function EffectIndex({
  categories,
  entries: synced,
  tree,
}: {
  categories: CategorySummary[];
  entries: EffectEntry[];
  tree: EffectTreeCategory[];
}) {
  const { manifest } = useEffectUploads();
  const entries = useMemo(() => [...uploadedEntries(manifest), ...synced], [manifest, synced]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<EffectKind | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const searching = query.trim() !== "" || kind !== null;
  const matches = useMemo(
    () => (searching ? searchEffects(entries, query, kind ?? undefined) : []),
    [entries, query, kind, searching],
  );
  const shown = useMemo(() => matches.slice(0, RESULT_LIMIT), [matches]);
  const position = useMemo(() => new Map(shown.map((entry, i) => [entry.id, i])), [shown]);

  const counts = useMemo(() => {
    const totals = Object.fromEntries(EFFECT_KINDS.map((k) => [k, 0])) as Record<EffectKind, number>;
    for (const entry of entries) totals[entry.kind] += 1;
    return totals;
  }, [entries]);

  return (
    <>
      <FilterPanel
        resetKey={`${query}|${kind}`}
        filters={(placement) => (
          <EffectFilters
            placement={placement}
            query={query}
            onQueryChange={setQuery}
            kind={kind}
            onKindChange={setKind}
            counts={counts}
            summary={
              searching ? `${matches.length} of ${entries.length} files` : `${entries.length} files`
            }
            label="Search every effect"
            placeholder="Search every effect…"
          />
        )}
        nav={<EffectTree categories={treeWithUploads(tree, manifest)} />}
      >
        {!searching ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        ) : matches.length === 0 ? (
          <p className={`${AppTextStyles.SMALL} rounded-2xl border border-dashed border-border-soft px-6 py-16 text-center`}>
            No file matches “{query}”. Names come from the files themselves, so
            they are mostly English — try “whoosh”, “burn” or “arrow”.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <EffectGrid
              entries={shown}
              onOpen={(entry) => setOpen(position.get(entry.id) ?? null)}
              showPack
            />
            {matches.length > shown.length && (
              <p className={`${AppTextStyles.SMALL} text-center`}>
                Showing the first {shown.length} of {matches.length}. Add a word to narrow it down.
              </p>
            )}
          </div>
        )}
      </FilterPanel>

      <EffectPreview entries={shown} index={open} onIndexChange={setOpen} />
    </>
  );
}
