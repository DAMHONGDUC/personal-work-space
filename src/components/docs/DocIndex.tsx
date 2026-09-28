"use client";

import { SearchInput } from "@/components/shared/SearchInput";
import { DocCard } from "@/components/docs/DocCard";
import { LanguageSwitch } from "@/components/docs/LanguageSwitch";
import { useDocLanguage } from "@/hooks/docs/useDocLanguage";
import { useDocSearch } from "@/hooks/docs/useDocSearch";
import { DOCS_ACCENT, type Lang, type Doc } from "@/lib/docs/doc-model";

/**
 * The guide list, in the reader's language. The choice is shared with the guide
 * pages, so picking a language here is still in force after opening one.
 *
 * Search runs over the language on screen and over the whole text of a guide,
 * diagram dialogs included: the page already ships every guide it lists, so
 * there is nothing to fetch and nothing to index at build time.
 */
export function DocIndex({ versions }: { versions: Record<Lang, Doc[]> }) {
  const [lang, setLang] = useDocLanguage();
  const docs = versions[lang];
  const { query, setQuery, results } = useDocSearch(docs);

  return (
    <>
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search guides"
          placeholder="Search guides…"
        />

        <div className="flex items-center gap-4">
          <p className="text-sm text-muted">
            {results.length === docs.length
              ? `${docs.length} ${docs.length === 1 ? "guide" : "guides"}`
              : `${results.length} of ${docs.length} guides`}
          </p>
          <LanguageSwitch lang={lang} onChange={setLang} accent={DOCS_ACCENT} />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-soft px-6 py-12 text-center text-sm text-muted">
          Nothing here matches “{query}”. The other language may — the search
          reads the guides as they are written, not translations of them.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map(({ doc, sections }) => (
            <DocCard key={doc.slug} doc={doc} lang={lang} sections={sections} />
          ))}
        </div>
      )}
    </>
  );
}
