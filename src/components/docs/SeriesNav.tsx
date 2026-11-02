"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { Lang, SeriesPage } from "@/lib/docs/doc-model";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { groupHolds, seriesPanels, type SeriesItem } from "@/lib/docs/series-tree";

/** The few words the series navigation prints, in the language of the guide. */
const LABELS = {
  page: { en: "Page", vi: "Trang" },
  previous: { en: "Previous", vi: "Trang trước" },
  next: { en: "Next", vi: "Trang tiếp" },
  of: { en: "of", vi: "/" },
  overview: { en: "Overview", vi: "Tổng quan" },
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
 * On wide screens it sits in the pinned contents column (`sidebar`), styled
 * like the page's own contents beneath it, so the other pages stay in reach
 * however far the reader scrolls. Smaller screens have no column and get it as
 * a card above the intro (`card`).
 *
 * A series split into panels ("Base docs", "Sprint guides") draws each as a
 * block of its own — its own card, or its own scrolled block in the sidebar —
 * headed by its name; the block holding the page being read shows the count.
 * A group opened by a page of its own (a sprint's README) is one row that
 * folds and unfolds its pages, that page first as its overview; only the group
 * holding the page being read starts unfolded. A group without one is a plain
 * heading over its pages.
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
  const panels = seriesPanels(pages);
  const sidebar = variant === "sidebar";
  const currentLink = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(
    () =>
      new Set(
        panels.flatMap((panel) =>
          panel.items.flatMap((item) => ("group" in item && groupHolds(item.group, current) ? [item.group.name] : [])),
        ),
      ),
  );
  // The block that shows the count: the one holding the page, else the first.
  const countedPanel = Math.max(
    0,
    panels.findIndex((panel) =>
      panel.items.some((item) => ("page" in item ? item.page.slug === current : groupHolds(item.group, current))),
    ),
  );

  // A long list runs past the bottom of its scrolled block; bring the page being
  // read into the block's view, moving only the block, never the page.
  useEffect(() => {
    const link = currentLink.current;
    const panel = link?.closest<HTMLElement>("[data-scroll-panel]");
    if (!sidebar || !link || !panel) return;

    // Where the link sits inside the block's scrolled content.
    const top = link.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    if (top < panel.scrollTop || top + link.offsetHeight > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = top - panel.clientHeight / 3;
    }
  }, [current, sidebar]);

  function toggle(group: string) {
    setOpen((before) => {
      const after = new Set(before);
      if (!after.delete(group)) after.add(group);
      return after;
    });
  }

  function pageLink(page: SeriesPage, nested: boolean, label = page.title[lang]) {
    const here = page.slug === current;

    return (
      <Link
        ref={here ? currentLink : undefined}
        href={pageHref(page)}
        aria-current={here ? "page" : undefined}
        className={
          sidebar
            ? `-ml-px block rounded-r-md border-l-2 py-1 pr-2 text-[0.9375rem] leading-6 transition-colors ${
                nested ? "pl-7" : "pl-4"
              } ${here ? "font-semibold" : "border-transparent text-muted hover:border-foreground/25 hover:text-foreground"}`
            : `block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                here ? "font-medium" : "text-muted hover:bg-muted-surface hover:text-foreground"
              }`
        }
        // In the sidebar, the same selected look as the contents list beneath it.
        style={
          here
            ? sidebar
              ? { borderColor: AppColors.DOCS, color: AppColors.DOCS, backgroundColor: AppColors.tint(AppColors.DOCS, 12) }
              : { backgroundColor: AppColors.tint(AppColors.DOCS, 14), color: AppColors.DOCS }
            : undefined
        }
      >
        {label}
      </Link>
    );
  }

  function item(entry: SeriesItem) {
    if ("page" in entry) {
      return <li key={entry.page.slug}>{pageLink(entry.page, false)}</li>;
    }

    const { group } = entry;
    const step = sidebar ? undefined : "ml-3";

    // A group without a page of its own: its name heads its pages, one small step in.
    if (!group.head) {
      return (
        <Fragment key={group.name}>
          <li role="presentation" className={`${AppTextStyles.EYEBROW} ${sidebar ? "pt-2 pb-0.5 pl-4" : "px-3 pt-3 pb-1"}`}>
            {group.name}
          </li>
          {group.pages.map((page) => (
            <li key={page.slug} className={step}>
              {pageLink(page, true)}
            </li>
          ))}
        </Fragment>
      );
    }

    const unfolded = open.has(group.name);
    const holds = groupHolds(group, current);

    return (
      <li key={group.name} data-group={group.name}>
        <button
          type="button"
          onClick={() => toggle(group.name)}
          aria-expanded={unfolded}
          className={`flex w-full items-center justify-between gap-2 text-left transition-colors ${
            sidebar
              ? "-ml-px rounded-r-md border-l-2 border-transparent py-1 pr-2 pl-4 text-[0.9375rem] leading-6 hover:border-foreground/25"
              : "rounded-lg px-3 py-1.5 text-sm hover:bg-muted-surface"
          } ${holds ? "font-medium text-foreground" : "text-muted hover:text-foreground"}`}
        >
          <span>{group.head.title[lang]}</span>
          <ChevronRight aria-hidden className={`size-4 shrink-0 transition-transform ${unfolded ? "rotate-90" : ""}`} />
        </button>
        {unfolded && (
          <ol className={`flex flex-col ${sidebar ? "gap-0.5" : "gap-1"}`}>
            <li className={step}>{pageLink(group.head, true, LABELS.overview[lang])}</li>
            {group.pages.map((page) => (
              <li key={page.slug} className={step}>
                {pageLink(page, true)}
              </li>
            ))}
          </ol>
        )}
      </li>
    );
  }

  return (
    <nav
      aria-label={name}
      data-variant={variant}
      className={sidebar ? "flex min-h-0 shrink flex-col gap-8" : "flex flex-col gap-4 lg:hidden"}
    >
      {panels.map((panel, position) => (
        <div
          key={panel.name ?? position}
          data-panel={panel.name}
          data-scroll-panel={sidebar ? true : undefined}
          className={
            sidebar
              ? "flex min-h-0 shrink flex-col gap-3 overflow-y-auto border-l border-border-soft [scrollbar-width:thin]"
              : "rounded-2xl border border-border-soft bg-surface p-5"
          }
        >
          <p className={`${AppTextStyles.EYEBROW} flex items-baseline justify-between gap-2 ${sidebar ? "pl-4" : ""}`}>
            <span>{panel.name ?? name}</span>
            {position === countedPanel && (
              <span className="shrink-0 tabular-nums normal-case tracking-normal">
                {sidebar
                  ? `${index + 1}/${pages.length}`
                  : `${LABELS.page[lang]} ${index + 1} ${LABELS.of[lang]} ${pages.length}`}
              </span>
            )}
          </p>
          <ol className={`flex flex-col ${sidebar ? "gap-0.5" : "mt-3 gap-1"}`}>{panel.items.map(item)}</ol>
        </div>
      ))}
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
