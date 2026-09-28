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
import {
  type Lang,
  type Doc,
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
      <ReadingProgress accent={AppColors.DOCS} />

      <DocHero doc={doc} lang={lang}>
        <LanguageSwitch lang={lang} onChange={setLang} accent={AppColors.DOCS} />
      </DocHero>

      {/* The chrome around the guide is English whatever the body is, so the
          body carries its own lang for screen readers and hyphenation. */}
      <main lang={lang} className={`mx-auto w-full max-w-5xl px-6 ${AppSpacings.AFTER_HERO} ${AppSpacings.PAGE_BOTTOM}`}>
        <MobileToc items={toc} accent={AppColors.DOCS} />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-14">
            <Prose paragraphs={doc.intro} />

            {doc.sections.map((section, index) => (
              <Section
                key={section.id}
                id={section.id}
                number={index + 1}
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
          </div>

          <SidebarToc items={toc} accent={AppColors.DOCS} />
        </div>
      </main>
    </>
  );
}
