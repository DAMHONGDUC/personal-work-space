import { Fragment } from "react";
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

/** The series' own name when it has one, else the title of its overview, part 0. */
function seriesName(pages: SeriesPage[], lang: Lang): string {
  return pages[0].seriesName ?? pages[0].title[lang];
}

/**
 * The pages of a series, at the top of each one: the series is named by its
 * overview (part 0), and the page being read is marked so the reader sees where
 * they are and how much is left.
 */
export function SeriesContents({
  pages,
  current,
  lang,
}: {
  pages: SeriesPage[];
  current: string;
  lang: Lang;
}) {
  const index = pages.findIndex((page) => page.slug === current);
  const name = seriesName(pages, lang);

  return (
    <nav
      aria-label={name}
      className="rounded-2xl border border-border-soft bg-surface p-5"
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
                  href={routes.doc(page.slug)}
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
      href={routes.doc(page.slug)}
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
