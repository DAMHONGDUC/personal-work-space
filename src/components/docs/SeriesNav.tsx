"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Lang, SeriesPage } from "@/lib/docs/doc-model";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** The few words the series navigation prints, in the language of the guide. */
const LABELS = {
  page: { en: "Page", vi: "Trang" },
  previous: { en: "Previous", vi: "Trang trước" },
  next: { en: "Next", vi: "Trang tiếp" },
  of: { en: "of", vi: "/" },
} satisfies Record<string, Record<Lang, string>>;

/**
 * Where a link to a series page goes: straight to its first section, so moving
 * through the series lands on content and its first contents entry is the one
 * selected, rather than on the hero above.
 */
function pageHref(page: SeriesPage): string {
  return page.firstSection ? `${routes.doc(page.slug)}#${page.firstSection}` : routes.doc(page.slug);
}

/** The series' own name when it has one, else the title of its overview, part 0. */
function seriesName(pages: SeriesPage[], lang: Lang): string {
  return pages[0].seriesName ?? pages[0].title[lang];
}

/**
 * The pages of a series: the series is named, and the page being read is
 * marked so the reader sees where they are and how much is left.
 *
 * On wide screens it sits in the pinned contents panel (`sidebar`), styled
 * like the page's own contents beneath it, so the other pages stay in reach
 * however far the reader scrolls. Smaller screens have no panel and get it as
 * a card above the intro (`card`).
 */
export function SeriesContents({
  pages,
  current,
  lang,
  variant = "card",
}: {
  pages: SeriesPage[];
  current: string;
  lang: Lang;
  variant?: "card" | "sidebar";
}) {
  const index = pages.findIndex((page) => page.slug === current);
  const name = seriesName(pages, lang);

  if (variant === "sidebar") {
    return <SidebarSeries pages={pages} current={current} lang={lang} name={name} index={index} />;
  }

  return (
    <nav
      aria-label={name}
      data-variant="card"
      className="rounded-2xl border border-border-soft bg-surface p-5 lg:hidden"
    >
      <p className={`${AppTextStyles.EYEBROW} flex items-baseline justify-between gap-3`}>
        <span>{name}</span>
        <span className="tabular-nums normal-case tracking-normal">
          {LABELS.page[lang]} {index + 1} {LABELS.of[lang]} {pages.length}
        </span>
      </p>
      <ol className="mt-3 flex flex-col gap-1">
        {pages.map((page, index) => {
          const here = page.slug === current;
          // A group's name heads its first page, and the group's pages sit one
          // small step in from it, so a long series reads in parts.
          const group = page.group && page.group !== pages[index - 1]?.group ? page.group : null;

          return (
            <Fragment key={page.slug}>
              {group && (
                <li role="presentation" className={`${AppTextStyles.EYEBROW} px-3 pt-3 pb-1`}>
                  {group}
                </li>
              )}
              <li className={page.group ? "ml-3" : undefined}>
                <Link
                  href={pageHref(page)}
                  aria-current={here ? "page" : undefined}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    here ? "font-medium" : "text-muted hover:bg-muted-surface hover:text-foreground"
                  }`}
                  style={
                    here
                      ? { backgroundColor: `${AppColors.tint(AppColors.DOCS, 14)}`, color: AppColors.DOCS }
                      : undefined
                  }
                >
                  {page.title[lang]}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The series in the pinned sidebar, drawn like the contents list under it: a
 * rule down the left, the current page marked on it in the accent, and each
 * group's pages one small step in from the group's name.
 */
function SidebarSeries({
  pages,
  current,
  lang,
  name,
  index,
}: {
  pages: SeriesPage[];
  current: string;
  lang: Lang;
  name: string;
  index: number;
}) {
  const currentLink = useRef<HTMLAnchorElement>(null);

  // A long series runs past the bottom of the pinned panel; bring the page being
  // read into the panel's view, moving only the panel, never the page.
  useEffect(() => {
    const link = currentLink.current;
    const panel = link?.closest<HTMLElement>("[data-scroll-panel]");
    if (!link || !panel) return;

    // Where the link sits inside the panel's scrolled content.
    const top = link.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    if (top < panel.scrollTop || top + link.offsetHeight > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = top - panel.clientHeight / 3;
    }
  }, [current]);

  return (
    <nav aria-label={name} data-variant="sidebar" className="flex flex-col gap-3 border-l border-border-soft">
      <p className={`${AppTextStyles.EYEBROW} flex items-baseline justify-between gap-2 pl-4`}>
        <span>{name}</span>
        <span className="shrink-0 tabular-nums normal-case tracking-normal">
          {index + 1}/{pages.length}
        </span>
      </p>
      <ol className="flex flex-col gap-0.5">
        {pages.map((page, position) => {
          const here = page.slug === current;
          const group = page.group && page.group !== pages[position - 1]?.group ? page.group : null;

          return (
            <Fragment key={page.slug}>
              {group && (
                <li role="presentation" className={`${AppTextStyles.EYEBROW} pt-2 pb-0.5 pl-4`}>
                  {group}
                </li>
              )}
              <li>
                <Link
                  ref={here ? currentLink : undefined}
                  href={pageHref(page)}
                  aria-current={here ? "page" : undefined}
                  className={`-ml-px block rounded-r-md border-l-2 py-1 pr-2 text-[0.9375rem] leading-6 transition-colors ${
                    page.group ? "pl-7" : "pl-4"
                  } ${
                    here
                      ? "font-semibold"
                      : "border-transparent text-muted hover:border-foreground/25 hover:text-foreground"
                  }`}
                  // The same selected look as the contents list beneath it.
                  style={
                    here
                      ? {
                          borderColor: AppColors.DOCS,
                          color: AppColors.DOCS,
                          backgroundColor: AppColors.tint(AppColors.DOCS, 12),
                        }
                      : undefined
                  }
                >
                  {page.title[lang]}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Previous and next page at the foot of a series page, so the reader who
 * finished one goes on to the next without scrolling back to the top.
 */
export function SeriesPager({
  pages,
  current,
  lang,
}: {
  pages: SeriesPage[];
  current: string;
  lang: Lang;
}) {
  const index = pages.findIndex((page) => page.slug === current);
  const previous = pages[index - 1];
  const next = pages[index + 1];

  return (
    <nav aria-label={seriesName(pages, lang)} className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <PagerLink page={previous} lang={lang} direction="previous" />
      ) : (
        <span aria-hidden />
      )}
      {next && <PagerLink page={next} lang={lang} direction="next" />}
    </nav>
  );
}

function PagerLink({
  page,
  lang,
  direction,
}: {
  page: SeriesPage;
  lang: Lang;
  direction: "previous" | "next";
}) {
  const next = direction === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={pageHref(page)}
      rel={direction === "next" ? "next" : "prev"}
      className={`group/pager flex flex-col gap-1 rounded-2xl border border-border-soft bg-surface px-5 py-4 transition-colors hover:bg-muted-surface ${
        next ? "items-end text-right sm:col-start-2" : ""
      }`}
    >
      <span className={`${AppTextStyles.CAPTION} flex items-center gap-1.5`}>
        {!next && <Arrow aria-hidden className="size-3.5" />}
        {LABELS[direction][lang]}
        {next && <Arrow aria-hidden className="size-3.5" />}
      </span>
      <span className="font-medium text-foreground">{page.title[lang]}</span>
    </Link>
  );
}
