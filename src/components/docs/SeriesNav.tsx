"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { Lang, SeriesPage } from "@/lib/docs/doc-model";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { PanelButton } from "@/components/docs/PanelButton";
import { PanelHeading } from "@/components/shared/PanelHeading";
import { groupHolds, panelStart, seriesPanels, type SeriesItem } from "@/lib/docs/series-tree";

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
 * A series split into panels ("Base docs", "Sprint guides") shows only the
 * panel holding the page being read, headed by its name in the accent; the
 * way into the other panels is the page header's (`SeriesShortcuts`), never
 * the panel's. The block has a fixed height and scrolls inside, so folding a
 * group never moves anything around it.
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
  // read into the block's view, moving only the block, never the page. Before
  // paint: the block is drawn afresh on every page, and scrolling after it
  // showed the top of the list for a frame, then jumped.
  useLayoutEffect(() => {
    const link = currentLink.current;
    const panel = link?.closest<HTMLElement>("[data-scroll-panel]");
    if (!link || !panel) return;

    // Where the link sits inside the block's scrolled content.
    const top = link.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    if (top < panel.scrollTop || top + link.offsetHeight > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = top - panel.clientHeight / 3;
    }
  }, [current]);

  // Panels show one at a time: the one holding the page being read.
  const shown = panels.every((panel) => panel.name) && panels.length > 1 ? [panels[countedPanel]] : panels;

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
            ? `-ml-px block rounded-r-md border-l-2 py-1 pr-2 text-[0.9375rem] leading-6 transition-colors duration-200 ${
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
          data-holds={holds || undefined}
          className={`flex w-full items-center justify-between gap-2 text-left transition-colors duration-200 ${
            sidebar
              ? "-ml-px rounded-r-md border-l-2 py-1 pr-2 pl-4 text-[0.9375rem] leading-6"
              : "rounded-lg px-3 py-1.5 text-sm"
          } ${
            holds
              ? "font-semibold text-white"
              : `text-muted hover:text-foreground ${sidebar ? "border-transparent hover:border-foreground/25" : "hover:bg-muted-surface"}`
          }`}
          // The sprint the reader is in is filled with the accent, so it reads
          // apart from the page inside it, which is only tinted.
          style={holds ? { backgroundColor: AppColors.DOCS, borderColor: AppColors.DOCS } : undefined}
        >
          <span>{group.head.title[lang]}</span>
          <ChevronRight
            aria-hidden
            className={`size-4 shrink-0 transition-transform duration-300 ease-(--pf-ease) motion-reduce:transition-none ${
              unfolded ? "rotate-90" : ""
            }`}
          />
        </button>
        {/* Folding slides the height from its own to none (grid rows 1fr ↔ 0fr)
            and fades it; folded, the list stays out of reach (inert). */}
        <div
          inert={!unfolded}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-(--pf-ease) motion-reduce:transition-none ${
            unfolded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          {/* The clip holds no padding of its own, so folded it is truly none high. */}
          <div className="min-h-0 overflow-hidden">
            <ol className={`flex flex-col ${sidebar ? "gap-0.5 pt-0.5" : "gap-1 pt-1"}`}>
              <li className={step}>{pageLink(group.head, true, LABELS.overview[lang])}</li>
              {group.pages.map((page) => (
                <li key={page.slug} className={step}>
                  {pageLink(page, true)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </li>
    );
  }

  return (
    <nav
      aria-label={name}
      data-variant={variant}
      className={sidebar ? "flex shrink-0 flex-col gap-8" : "flex flex-col gap-4 lg:hidden"}
    >
      {shown.map((panel) => {
        const position = panels.indexOf(panel);
        const count = position === countedPanel && (
          <span className="shrink-0 tabular-nums normal-case tracking-normal">
            {sidebar
              ? `${index + 1}/${pages.length}`
              : `${LABELS.page[lang]} ${index + 1} ${LABELS.of[lang]} ${pages.length}`}
          </span>
        );
        const list = <ol className={`flex flex-col ${sidebar ? "gap-0.5" : "gap-1"}`}>{panel.items.map(item)}</ol>;

        if (sidebar) {
          return (
            <div
              key={panel.name ?? position}
              data-panel={panel.name}
              data-scroll-panel
              // A named panel keeps one height whatever is folded; a lone list is capped instead.
              className={`flex shrink-0 flex-col gap-3 overflow-y-auto border-l border-border-soft [scrollbar-width:thin] ${
                panel.name ? "h-[45vh]" : "max-h-[40vh]"
              }`}
            >
              <PanelHeading accent={AppColors.DOCS}>
                <span>{panel.name ?? name}</span>
                {count}
              </PanelHeading>
              {list}
            </div>
          );
        }

        return (
          <div
            key={panel.name ?? position}
            data-panel={panel.name}
            className="rounded-2xl border border-border-soft bg-surface p-5"
          >
            <p
              className={`${AppTextStyles.EYEBROW} flex items-baseline justify-between gap-2`}
              style={panel.name ? { color: AppColors.DOCS } : undefined}
            >
              <span>{panel.name ?? name}</span>
              {count}
            </p>
            {panel.name ? (
              <div data-scroll-panel className="mt-3 h-72 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                {list}
              </div>
            ) : (
              <div className="mt-3">{list}</div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * One button per panel of the series, for every page's header: the base docs
 * and the sprint guides are each one click away from anywhere in the series,
 * on any screen; the panel being read is marked.
 */
export function SeriesShortcuts({ pages, current }: { pages: SeriesPage[]; current: string }) {
  const panels = seriesPanels(pages);
  const position = panels.findIndex((panel) =>
    panel.items.some((item) => ("page" in item ? item.page.slug === current : groupHolds(item.group, current))),
  );
  if (position < 0 || panels.length < 2 || !panels.every((panel) => panel.name)) return null;

  return (
    <div data-shortcuts className="flex flex-wrap gap-2">
      {panels.map((panel, index) => (
        <PanelButton key={panel.name} href={pageHref(panelStart(panel))} name={panel.name!} active={index === position} />
      ))}
    </div>
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
