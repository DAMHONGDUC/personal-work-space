"use client";

import { useActiveSection } from "@/hooks/scroll/useActiveSection";

export type NavItem = { id: string; title: string };

/**
 * Table of contents that tracks the section currently in view. Rendered in the
 * sidebar on desktop and inside a collapsed <details> on smaller screens.
 *
 * The numbers come from the position in this list, which is the same list the
 * page numbers its headings from. `numbered={false}` leaves them out, for pages
 * whose titles are numbered already.
 */
export function PolicyNav({
  items,
  accent,
  numbered = true,
}: {
  items: NavItem[];
  accent: string;
  numbered?: boolean;
}) {
  const active = useActiveSection(items.map((item) => item.id));

  return (
    <ol className="flex flex-col gap-0.5">
      {items.map((item, index) => {
        const isActive = item.id === active;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              className={`-ml-px flex gap-1 border-l py-1 pl-4 text-sm leading-6 transition-colors ${
                isActive
                  ? "font-medium text-foreground"
                  : "border-transparent text-muted hover:border-foreground/25 hover:text-foreground"
              }`}
              style={isActive ? { borderColor: accent } : undefined}
            >
              {numbered && (
                <span aria-hidden className="w-5 shrink-0 tabular-nums opacity-60">
                  {index + 1}
                </span>
              )}
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
