"use client";

import { SearchInput } from "@/components/shared/SearchInput";
import { DocCard } from "@/components/docs/DocCard";
import { LanguageSwitch } from "@/components/docs/LanguageSwitch";
import { useDocLanguage } from "@/hooks/docs/useDocLanguage";
import { useDocSearch } from "@/hooks/docs/useDocSearch";
import {
  DOC_TOPICS,
  TOPIC_LABELS,
  type Doc,
  type Lang,
} from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The guide list, in the reader's language. The choice is shared with the guide
 * pages, so picking a language here is still in force after opening one.
 *
 * Search runs over the language on screen and over the whole text of a guide,
 * diagram dialogs included: the page already ships every guide it lists, so
 * there is nothing to fetch and nothing to index at build time.
 *
 * The cards are shelved by topic, in `DOC_TOPICS` order, and a shelf that the
 * search has emptied is left out rather than drawn as a heading over nothing.
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
          <p className={AppTextStyles.SMALL}>
            {results.length === docs.length
              ? `${docs.length} ${docs.length === 1 ? "guide" : "guides"}`
              : `${results.length} of ${docs.length} guides`}
          </p>
          <LanguageSwitch lang={lang} onChange={setLang} accent={AppColors.DOCS} />
        </div>
      </div>

      {results.length === 0 ? (
        <p className={`${AppTextStyles.SMALL} rounded-2xl border border-dashed border-border-soft px-6 py-12 text-center`}>
          Nothing here matches “{query}”. The other language may — the search
          reads the guides as they are written, not translations of them.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {DOC_TOPICS.map((topic) => {
            const shelf = results.filter(({ doc }) => doc.topic === topic);
            if (shelf.length === 0) return null;

            return (
              <section key={topic} aria-labelledby={`topic-${topic}`} className="flex flex-col gap-4">
                <h2
                  id={`topic-${topic}`}
                  lang={lang}
                  className={`${AppTextStyles.SMALL} flex items-baseline gap-3 font-medium uppercase tracking-wider`}
                >
                  {TOPIC_LABELS[topic][lang]}
                  <span className="text-xs font-normal normal-case tracking-normal">
                    {shelf.length}
                  </span>
                </h2>
                {shelf.map(({ doc, sections }) => (
                  <DocCard key={doc.slug} doc={doc} lang={lang} sections={sections} />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
