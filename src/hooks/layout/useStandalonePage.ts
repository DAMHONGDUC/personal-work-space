"use client";

import { usePathname } from "next/navigation";
import { PORTFOLIO_SECTIONS } from "@/lib/portfolio/portfolio-model";
import { routes } from "@/lib/routes/routes";

export type HeaderSection = { readonly id: string; readonly label: string };

/** A page that stands on its own, apart from the rest of the site. */
export type StandalonePage = {
  /** Its own path, which the publisher's name in the header returns to. */
  path: string;
  /** Its sections, pinned in the header in place of the way home. */
  sections: readonly HeaderSection[];
};

/**
 * Pages that stand on their own, by path. On one of these the header belongs
 * to the page: its sections replace the Home link, and the publisher's name
 * takes the reader back to the page's top rather than out to the site's home.
 * Every other page keeps the ordinary header.
 */
const STANDALONE_PAGES: Record<string, readonly HeaderSection[]> = {
  [routes.portfolio]: PORTFOLIO_SECTIONS,
};

/**
 * The standalone page the reader is on, or null on an ordinary page.
 *
 * Each page is prerendered at its own path, so the first paint already
 * resolves the right answer.
 */
export function useStandalonePage(): StandalonePage | null {
  // Paths carry a trailing slash under `trailingSlash: true`; routes do not.
  const path = (usePathname() ?? routes.home).replace(/(.)\/$/, "$1");
  const sections = STANDALONE_PAGES[path];

  return sections ? { path, sections } : null;
}
