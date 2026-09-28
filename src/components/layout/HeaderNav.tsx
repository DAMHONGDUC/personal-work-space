"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useActiveSection } from "@/hooks/scroll/useActiveSection";
import { PORTFOLIO_SECTIONS } from "@/lib/portfolio/portfolio-model";
import { routes } from "@/lib/routes/routes";
import { AppTextStyles } from "@/lib/design/app-text-styles";

type HeaderSection = { readonly id: string; readonly label: string };

/**
 * Pages whose sections are pinned in the header, by path. A page listed here
 * gets its own contents in the bar while it scrolls; every other page gets the
 * way home. The list is the page's own, so the headings and the links cannot
 * drift apart.
 */
const PAGE_SECTIONS: Record<string, readonly HeaderSection[]> = {
  [routes.portfolio]: PORTFOLIO_SECTIONS,
};

const NONE: readonly HeaderSection[] = [];

/**
 * The right-hand side of the sticky header.
 *
 * A client component only because it reads the path and follows the scroll;
 * each page is prerendered at its own path, so the first paint already shows
 * the right links.
 */
export function HeaderNav() {
  // Paths carry a trailing slash under `trailingSlash: true`; routes do not.
  const path = (usePathname() ?? routes.home).replace(/(.)\/$/, "$1");
  const sections = PAGE_SECTIONS[path] ?? NONE;
  const active = useActiveSection(sections.map((section) => section.id));
  const listRef = useRef<HTMLUListElement>(null);

  // On a narrow screen the links scroll sideways; keep the current one in view.
  // Scrolls the list only, never the page.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !link) return;

    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    // scroll-smooth on the list animates this; plain assignment works
    // everywhere, including where Element.scrollTo is missing.
    list.scrollLeft = left;
  }, [active]);

  if (sections.length === 0) {
    return (
      <nav className={AppTextStyles.SMALL}>
        <Link href={routes.home} className="transition-colors hover:text-foreground">
          Home
        </Link>
      </nav>
    );
  }

  return (
    // data-sections lets the header drop the publisher's name on a phone,
    // so the links get the width.
    <nav aria-label="On this page" data-sections className="-mr-2 min-w-0">
      <ul
        ref={listRef}
        className={`${AppTextStyles.SMALL} flex items-center gap-1 overflow-x-auto scroll-smooth whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className="block rounded-lg px-2 py-1.5 transition-colors hover:text-foreground aria-[current=location]:bg-muted-surface aria-[current=location]:text-foreground"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
