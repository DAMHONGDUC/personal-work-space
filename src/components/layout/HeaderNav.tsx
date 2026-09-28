"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useStandalonePage, type HeaderSection } from "@/hooks/layout/useStandalonePage";
import { useActiveSection } from "@/hooks/scroll/useActiveSection";
import { routes } from "@/lib/routes/routes";
import { AppTextStyles } from "@/lib/design/app-text-styles";

const NONE: readonly HeaderSection[] = [];

/**
 * The right-hand side of the sticky header.
 *
 * The way home, or on a standalone page its own sections, with the one on
 * screen highlighted. A client component only because it reads the path and
 * follows the scroll.
 */
export function HeaderNav() {
  const sections = useStandalonePage()?.sections ?? NONE;
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
    <nav aria-label="On this page" className="-mr-2 min-w-0">
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
