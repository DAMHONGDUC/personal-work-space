"use client";

import type { NavItem } from "@/components/policy/PolicyNav";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { DocBlocks } from "@/components/docs/DocBlocks";
import { DocHero } from "@/components/docs/DocHero";
import { LanguageSwitch } from "@/components/docs/LanguageSwitch";
import { MobileToc, SidebarToc } from "@/components/policy/PolicyToc";
import { Prose } from "@/components/policy/Prose";
import { Section } from "@/components/policy/Section";
import { useDocLanguage } from "@/hooks/docs/useDocLanguage";
import { DOCS_ACCENT, type Lang, type Doc } from "@/lib/docs/doc-model";

/**
 * One guide, in whichever language the reader picked.
 *
 * Every language is resolved at build time and shipped together, so switching
 * is a re-render: no request, no navigation, and because section ids are the
 * same in both, the anchor you arrived on still points at the same place.
 */
export function DocArticle({ versions }: { versions: Record<Lang, Doc> }) {
  const [lang, setLang] = useDocLanguage();
  const doc = versions[lang];

  const toc: NavItem[] = doc.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <>
      <ReadingProgress accent={DOCS_ACCENT} />

      <DocHero doc={doc} lang={lang}>
        <LanguageSwitch lang={lang} onChange={setLang} accent={DOCS_ACCENT} />
      </DocHero>

      {/* The chrome around the guide is English whatever the body is, so the
          body carries its own lang for screen readers and hyphenation. */}
      <main lang={lang} className="mx-auto w-full max-w-5xl px-6 pb-20 pt-14">
        <MobileToc items={toc} accent={DOCS_ACCENT} />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-14">
            <Prose paragraphs={doc.intro} />

            {doc.sections.map((section, index) => (
              <Section
                key={section.id}
                id={section.id}
                number={index + 1}
                title={section.title}
                accent={DOCS_ACCENT}
              >
                {section.summary && (
                  <p className="-mt-1 max-w-[68ch] text-base leading-7 text-muted">
                    {section.summary}
                  </p>
                )}
                <DocBlocks
                  blocks={section.blocks}
                  accent={DOCS_ACCENT}
                  lang={lang}
                />
              </Section>
            ))}
          </div>

          <SidebarToc items={toc} accent={DOCS_ACCENT} />
        </div>
      </main>
    </>
  );
}
