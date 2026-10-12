"use client";

import { useState } from "react";
import { useActiveSection } from "@/hooks/scroll/useActiveSection";
import { scrollToSection } from "@/lib/scroll/scroll-to-section";
import { AppColors } from "@/lib/design/app-colors";

export type NavItem = { id: string; title: string };

/**
 * Table of contents that tracks the section currently in view. Rendered in the
 * sidebar on desktop and inside a collapsed <details> on smaller screens.
 *
 * The numbers come from the position in this list, which is the same list the
 * page numbers its headings from. `numbered={false}` leaves them out, for pages
 * whose titles are numbered already.
 *
 * A click scrolls by script (`scrollToSection`) rather than leaving it to the
 * link, so the page moves even where smooth scrolling never starts; a click
 * with a modifier key still does what the browser does with a link. The
 * clicked item shows as selected at once, not only when the scroll arrives,
 * so the list does not flicker through every section passed on the way. The
 * selected item reads at a glance: tinted, in the accent, with a thick bar.
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
  const reached = useActiveSection(items.map((item) => item.id));
  const [clicked, setClicked] = useState<string | null>(null);
  const active = clicked ?? reached;

  return (
    <ol className="flex flex-col gap-0.5">
      {items.map((item, index) => {
        const isActive = item.id === active;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                  return;
                }
                if (scrollToSection(item.id, () => setClicked(null))) {
                  event.preventDefault();
                  setClicked(item.id);
                }
              }}
              aria-current={isActive ? "location" : undefined}
              className={`-ml-px flex gap-1 rounded-r-md border-l-2 py-1 pr-2 pl-4 text-sm leading-6 transition-colors ${
                isActive
                  ? "font-semibold"
                  : "border-transparent text-muted hover:border-foreground/25 hover:text-foreground"
              }`}
              style={
                isActive
                  ? { borderColor: accent, color: accent, backgroundColor: AppColors.tint(accent, 12) }
                  : undefined
              }
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
