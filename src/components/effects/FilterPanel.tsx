"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Where a copy of the filters is drawn. */
export type FilterPlacement = "panel" | "bar";

/** The sticky site header, which anything pinned has to sit below. */
const HEADER_HEIGHT = 64;

/**
 * A pinned left panel holding the filters and the navigation tree, beside the
 * results. It is there from the first paint and stays put while the results
 * scroll, so filtering or heading back up the tree is always one click away.
 *
 * A phone has no room for a panel, so the filters pin as a bar under the
 * header instead, and the tree gives way to the breadcrumb above.
 *
 * `filters` is called once per placement and bound to the same state, so the
 * two copies never disagree.
 */
export function FilterPanel({
  filters,
  nav,
  resetKey,
  children,
}: {
  filters: (placement: FilterPlacement) => ReactNode;
  nav: ReactNode;
  /**
   * Changes whenever the filters do. A change made deep in the page can
   * shorten it under the reader, so the results are brought back to their top
   * rather than leaving the reader staring at empty space.
   */
  resetKey: string;
  children: ReactNode;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!contentRef.current) return;

    // The bar is display:none on a wide screen, and measures 0 there.
    const pinned = HEADER_HEIGHT + (barRef.current?.offsetHeight ?? 0) + 8;
    const top = contentRef.current.getBoundingClientRect().top + window.scrollY - pinned;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "instant" });
  }, [resetKey]);

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col gap-7 overflow-y-auto overscroll-contain p-0.5 pb-6 pr-1 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
          <div className="flex flex-col gap-3">{filters("panel")}</div>
          {nav}
        </div>
      </aside>

      <div className="min-w-0">
        <div
          ref={barRef}
          className="sticky top-16 z-10 -mx-6 mb-6 border-b border-border-soft bg-background/95 px-6 py-2 backdrop-blur lg:hidden"
        >
          {filters("bar")}
        </div>

        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}
