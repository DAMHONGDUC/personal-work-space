"use client";

import { AppCard, type DirectoryEntry } from "@/components/directory/AppCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { useAppSearch } from "@/hooks/apps/useAppSearch";
import { AppTextStyles } from "@/lib/design/app-text-styles";

export type { DirectoryEntry };

export function AppDirectory({ entries }: { entries: DirectoryEntry[] }) {
  const { query, setQuery, results } = useAppSearch(entries);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search apps"
          placeholder="Search apps…"
        />
        <p className={AppTextStyles.SMALL}>
          {results.length === entries.length
            ? `${entries.length} ${entries.length === 1 ? "app" : "apps"}`
            : `${results.length} of ${entries.length} apps`}
        </p>
      </div>

      {results.length === 0 ? (
        <p className={`${AppTextStyles.SMALL} rounded-2xl border border-dashed border-border-soft px-6 py-16 text-center`}>
          No app matches “{query}”.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((entry) => (
            <li key={entry.slug}>
              <AppCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
