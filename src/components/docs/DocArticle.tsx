"use client";

import { useRef } from "react";
import type { NavItem } from "@/components/policy/PolicyNav";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { DocBlocks } from "@/components/docs/DocBlocks";
import { DocHero } from "@/components/docs/DocHero";
import { LanguageSwitch } from "@/components/docs/LanguageSwitch";
import { SeriesContents, SeriesPager } from "@/components/docs/SeriesNav";
import { MobileToc, SidebarToc } from "@/components/policy/PolicyToc";
import { Prose } from "@/components/policy/Prose";
import { Section } from "@/components/policy/Section";
import { useDocLanguage } from "@/hooks/docs/useDocLanguage";
import { useSectionLinks } from "@/hooks/scroll/useSectionLinks";
import {
  type Lang,
  type Doc,
  type SeriesPage,
} from "@/lib/docs/doc-model";
import { AppSpacings } from "@/lib/design/app-spacings";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * One guide, in whichever language the reader picked.
 *
 * Every language is resolved at build time and shipped together, so switching
 * is a re-render: no request, no navigation, and because section ids are the
 * same in both, the anchor you arrived on still points at the same place.
 *
 * A guide that is one page of a series lists the series above its intro and
 * again in the pinned sidebar, and links the previous and next page below its
 * last section.
 */
export function DocArticle({
  versions,
  series,
}: {
  versions: Record<Lang, Doc>;
  series?: SeriesPage[];
}) {
  const [chosen, setLang] = useDocLanguage(versions.en.defaultLang);
  // The body's own #section links scroll like the contents list does.
  const body = useRef<HTMLDivElement>(null);
  useSectionLinks(body);
  // A guide written in one language is read in it whatever the reader chose,
  // and offers no switch.
  const only = versions.en.languages?.length === 1 ? versions.en.languages[0] : undefined;
  const lang = only ?? chosen;
  const doc = versions[lang];
  const numbered = doc.numbered !== false;

  const toc: NavItem[] = doc.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <>
      <ReadingProgress accent={AppColors.DOCS} />

      <DocHero doc={doc} lang={lang}>
        {!only && <LanguageSwitch lang={lang} onChange={setLang} accent={AppColors.DOCS} />}
      </DocHero>

      {/* The chrome around the guide is English whatever the body is, so the
          body carries its own lang for screen readers and hyphenation. */}
      <main lang={lang} className={`mx-auto w-full max-w-5xl px-6 ${AppSpacings.AFTER_HERO} ${AppSpacings.PAGE_BOTTOM}`}>
        <MobileToc items={toc} accent={AppColors.DOCS} numbered={numbered} />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
          <div ref={body} className="flex min-w-0 flex-col gap-14">
            {series && <SeriesContents pages={series} current={doc.slug} lang={lang} />}

            <Prose paragraphs={doc.intro} />

            {doc.sections.map((section, index) => (
              <Section
                key={section.id}
                id={section.id}
                number={numbered ? index + 1 : undefined}
                title={section.title}
                accent={AppColors.DOCS}
              >
                {section.summary && (
                  <p className={`${AppTextStyles.BODY} -mt-1 max-w-[68ch]`}>
                    {section.summary}
                  </p>
                )}
                <DocBlocks
                  blocks={section.blocks}
                  accent={AppColors.DOCS}
                  lang={lang}
                />
              </Section>
            ))}

            {series && <SeriesPager pages={series} current={doc.slug} lang={lang} />}
          </div>

          <SidebarToc items={toc} accent={AppColors.DOCS} numbered={numbered}>
            {series && (
              <SeriesContents pages={series} current={doc.slug} lang={lang} variant="sidebar" />
            )}
          </SidebarToc>
        </div>
      </main>
    </>
  );
}
