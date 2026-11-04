"use client";

import { useMemo } from "react";
import type { DirectoryEntry } from "@/components/directory/AppCard";
import { useQueryText } from "@/hooks/routes/useQueryParam";
import { APPS_QUERY } from "@/lib/routes/routes";

/**
 * Filters the app list by name, slug or tagline. The query lives in the
 * address (`?q=`), so a reload or a shared link opens on the same matches.
 */
export function useAppSearch(entries: DirectoryEntry[]) {
  const [query, setQuery] = useQueryText(APPS_QUERY.search);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;

    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(term) ||
        entry.slug.toLowerCase().includes(term) ||
        entry.tagline.toLowerCase().includes(term),
    );
  }, [entries, query]);

  return { query, setQuery, results };
}
