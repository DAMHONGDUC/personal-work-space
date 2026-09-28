"use client";

import { useMemo, useState } from "react";
import type { DirectoryEntry } from "@/components/directory/AppCard";

/** Filters the app list by name, slug or tagline. */
export function useAppSearch(entries: DirectoryEntry[]) {
  const [query, setQuery] = useState("");

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
