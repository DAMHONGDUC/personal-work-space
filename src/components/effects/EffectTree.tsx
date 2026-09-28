"use client";

import { ChevronRight, Library } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useActiveSection } from "@/hooks/scroll/useActiveSection";
import {
  type EffectTreeCategory,
} from "@/lib/effects/effect-model";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";

const ROW =
  "flex min-w-0 flex-1 items-baseline justify-between gap-2 rounded-md py-1 pr-1 text-sm leading-6 transition-colors";

function Count({ value }: { value: number }) {
  return <span className="shrink-0 text-xs tabular-nums opacity-60">{value}</span>;
}

/**
 * The library as a tree: the library itself, every category, and the packs of
 * whichever category is open. The way back is always one click up the tree,
 * wherever the reader has scrolled to, and a neighbouring category is one click
 * across.
 *
 * On a category page that category starts open, its packs are anchors on the
 * page, and `visibleCounts` gives them the counts after filtering — a pack the
 * filters empty drops out, as its section does. Any other category can be
 * opened to peek at its packs, which link to that page.
 */
export function EffectTree({
  categories,
  current,
  visibleCounts,
}: {
  categories: EffectTreeCategory[];
  /** The category on screen; none on the library's front page. */
  current?: string;
  visibleCounts?: Map<string, number>;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(current ? [current] : []));

  const currentPacks =
    categories
      .find((category) => category.id === current)
      ?.packs.filter((pack) => (visibleCounts?.get(pack.slug) ?? pack.count) > 0) ?? [];
  const active = useActiveSection(currentPacks.map((pack) => pack.slug));

  function toggle(id: string) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <nav aria-label="Effects library" className="flex flex-col gap-1 text-sm">
      <Link
        href={routes.effects}
        aria-current={current ? undefined : "page"}
        className={`${ROW} flex-none items-center justify-start gap-2 px-2 ${
          current ? "text-muted hover:bg-muted-surface hover:text-foreground" : "font-medium text-foreground"
        }`}
      >
        <Library className="size-4 shrink-0" />
        All effects
      </Link>

      <ul className="ml-3.5 flex flex-col gap-0.5 border-l border-border-soft pl-2">
        {categories.map((category) => {
          const isCurrent = category.id === current;
          const isOpen = open.has(category.id);
          const packs = isCurrent ? currentPacks : category.packs;

          return (
            <li key={category.id}>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => toggle(category.id)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.label}`}
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
                >
                  <ChevronRight
                    className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>
                <Link
                  href={routes.effectCategory(category.id)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`${ROW} pl-1 ${
                    isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted hover:bg-muted-surface hover:text-foreground"
                  }`}
                  style={isCurrent ? { color: AppColors.EFFECTS } : undefined}
                >
                  <span className="min-w-0">{category.label}</span>
                  <Count value={category.total} />
                </Link>
              </div>

              {isOpen && packs.length > 0 && (
                <ul className="mb-1 ml-3 flex flex-col border-l border-border-soft">
                  {packs.map((pack) => {
                    const isActive = isCurrent && pack.slug === active;
                    const count = isCurrent ? (visibleCounts?.get(pack.slug) ?? pack.count) : pack.count;
                    const className = `-ml-px ${ROW} border-l pl-3 ${
                      isActive
                        ? "font-medium text-foreground"
                        : "border-transparent text-muted hover:border-foreground/25 hover:text-foreground"
                    }`;
                    const style = isActive ? { borderColor: AppColors.EFFECTS } : undefined;
                    const body = (
                      <>
                        <span className="min-w-0">{pack.name}</span>
                        <Count value={count} />
                      </>
                    );

                    return (
                      <li key={pack.slug} className="flex">
                        {isCurrent ? (
                          <a
                            href={`#${pack.slug}`}
                            aria-current={isActive ? "location" : undefined}
                            className={className}
                            style={style}
                          >
                            {body}
                          </a>
                        ) : (
                          <Link
                            href={`${routes.effectCategory(category.id)}#${pack.slug}`}
                            className={className}
                          >
                            {body}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
