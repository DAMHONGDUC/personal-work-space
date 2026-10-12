"use client";

import { type RefObject, useEffect } from "react";
import { scrollToSection } from "@/lib/scroll/scroll-to-section";

/**
 * Makes every `#section` link inside `container` scroll the way the contents
 * list does (`scrollToSection`): smooth, then corrected if the page grew under
 * it. A guide's body links to its own sections — "see §8", a step number in a
 * table — and those otherwise fall back to the browser's own jump.
 *
 * One listener on the container rather than a handler per link: the synced
 * guides' links live in HTML drawn as a string, where React attaches nothing.
 * A click with a modifier key, or on a link to another page, is left alone.
 */
export function useSectionLinks(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return;

      if (scrollToSection(decodeURIComponent(href.slice(1)))) event.preventDefault();
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [container]);
}
