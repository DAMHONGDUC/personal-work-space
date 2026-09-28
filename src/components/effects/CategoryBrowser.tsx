"use client";

import { FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { EffectFilters } from "@/components/effects/EffectFilters";
import { EffectGrid } from "@/components/effects/EffectGrid";
import { EffectPreview } from "@/components/effects/EffectPreview";
import { EffectTree } from "@/components/effects/EffectTree";
import { FilterPanel } from "@/components/effects/FilterPanel";
import { useEffectUploads } from "@/hooks/effects/useEffectUploads";
import {
  EFFECT_KINDS,
  driveFolderUrl,
  entriesOf,
  type EffectEntry,
  type EffectKind,
  type EffectPack,
  type EffectTreeCategory,
} from "@/lib/effects/effect-model";
import { searchEffects } from "@/lib/effects/effect-search";
import {
  UPLOADS_PACK_NAME,
  UPLOADS_PACK_SLUG,
  treeWithUploads,
  uploadedEntries,
} from "@/lib/effects/effect-uploads";
import { routes } from "@/lib/routes/routes";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** Consecutive entries sharing a sub-folder, in the order the pack lists them. */
function groupsOf(entries: EffectEntry[]): { group: string; entries: EffectEntry[] }[] {
  const groups: { group: string; entries: EffectEntry[] }[] = [];

  for (const entry of entries) {
    const group = entry.group ?? "";
    const last = groups.at(-1);
    if (last && last.group === group) last.entries.push(entry);
    else groups.push({ group, entries: [entry] });
  }

  return groups;
}

/**
 * Every file in one category, a section per pack and a heading per sub-folder,
 * with a search and a kind filter over the lot. The page ships the whole
 * category, so filtering is a re-render and nothing is fetched but thumbnails.
 */
export function CategoryBrowser({
  category,
  packs,
  tree,
}: {
  /** The category's id, which the tree opens and marks. */
  category: string;
  packs: EffectPack[];
  tree: EffectTreeCategory[];
}) {
  // Uploads arrive from Drive after the page has rendered, as a pack of their
  // own above the synced ones.
  const { manifest } = useEffectUploads();
  const uploads = useMemo(() => uploadedEntries(manifest, category), [manifest, category]);
  const entries = useMemo(() => [...uploads, ...entriesOf(packs)], [uploads, packs]);
  const shelves: { slug: string; name: string; folderId?: string }[] = useMemo(
    () => [
      ...(uploads.length > 0 ? [{ slug: UPLOADS_PACK_SLUG, name: UPLOADS_PACK_NAME }] : []),
      ...packs,
    ],
    [uploads, packs],
  );
  const counts = useMemo(() => {
    const totals = Object.fromEntries(EFFECT_KINDS.map((k) => [k, 0])) as Record<EffectKind, number>;
    for (const entry of entries) totals[entry.kind] += 1;
    return totals;
  }, [entries]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<EffectKind | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => searchEffects(entries, query, kind ?? undefined), [entries, query, kind]);
  const position = useMemo(() => new Map(visible.map((entry, i) => [entry.id, i])), [visible]);
  const filtered = visible.length !== entries.length;

  const sections = shelves
    .map((pack) => ({ pack, entries: visible.filter((entry) => entry.packSlug === pack.slug) }))
    .filter((section) => section.entries.length > 0);
  const visibleCounts = new Map(sections.map(({ pack, entries: shown }) => [pack.slug, shown.length]));

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
            summary={filtered ? `${visible.length} of ${entries.length} files` : `${entries.length} files`}
            label="Search this category"
            placeholder="Search by name…"
            backHref={routes.effects}
          />
        )}
        nav={
          // Keyed so moving to another category opens that one afresh.
          <EffectTree
            key={category}
            categories={treeWithUploads(tree, manifest)}
            current={category}
            visibleCounts={visibleCounts}
          />
        }
      >
        {/* The tree in the left panel carries this list on a wide screen. */}
        {sections.length > 1 && (
          <nav aria-label="Packs" className="pb-10 lg:hidden">
            <ul className="flex flex-wrap gap-2">
              {sections.map(({ pack, entries: shown }) => (
                <li key={pack.slug}>
                  <a
                    href={`#${pack.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-sm transition-colors hover:border-foreground/25"
                  >
                    {pack.name}
                    <span className={AppTextStyles.CAPTION}>{shown.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {sections.length === 0 ? (
          <p className={`${AppTextStyles.SMALL} rounded-2xl border border-dashed border-border-soft px-6 py-16 text-center`}>
            No file here matches “{query}”.
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            {sections.map(({ pack, entries: shown }) => (
              // Clear of the filter bar pinned under the header on a phone.
              <section
                key={pack.slug}
                id={pack.slug}
                className="flex flex-col gap-6 max-lg:scroll-mt-20"
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-soft pb-3">
                  <h2 className={AppTextStyles.CARD_TITLE}>
                    {pack.name}
                    <span className={`${AppTextStyles.SMALL} pl-2 font-normal`}>
                      {shown.length} {shown.length === 1 ? "file" : "files"}
                    </span>
                  </h2>
                  {pack.folderId && (
                    <a
                      href={driveFolderUrl(pack.folderId)}
                      target="_blank"
                      rel="noreferrer"
                      className={`${AppTextStyles.SMALL} flex items-center gap-1.5 transition-colors hover:text-foreground`}
                    >
                      <FolderOpen className="size-4" />
                      Drive folder
                    </a>
                  )}
                </div>

                {groupsOf(shown).map(({ group, entries: inGroup }) => (
                  <div key={group} className="flex flex-col gap-3">
                    {group && (
                      <h3 className={AppTextStyles.EYEBROW}>
                        {group}
                      </h3>
                    )}
                    <EffectGrid
                      entries={inGroup}
                      onOpen={(entry) => setOpen(position.get(entry.id) ?? null)}
                    />
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </FilterPanel>

      <EffectPreview entries={visible} index={open} onIndexChange={setOpen} />
    </>
  );
}
