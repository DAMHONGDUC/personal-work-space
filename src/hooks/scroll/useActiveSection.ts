"use client";

import { useEffect, useState } from "react";

/** Line under the sticky header where a heading counts as "reached". */
const HEADER_OFFSET = 120;

/**
 * Id of the section currently in view, for highlighting a table of contents.
 *
 * Positions are measured directly on every scroll rather than read from
 * IntersectionObserver entries: an observer callback only reports sections
 * whose intersection *changed*, so scrolling within one tall section, or
 * jumping straight to an anchor, would leave the highlight stale.
 */
export function useActiveSection(ids: string[], fallback = "") {
  const [active, setActive] = useState(ids[0] ?? fallback);

  // Depend on the joined key so a new array with the same ids does not re-run.
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key ? key.split("|") : [];
    if (sectionIds.length === 0) return;

    const measure = () => {
      // The last heading to have passed under the header wins.
      let current = sectionIds[0];
      let closest = -Infinity;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const { top } = element.getBoundingClientRect();
        if (top <= HEADER_OFFSET && top > closest) {
          closest = top;
          current = id;
        }
      }

      // At the end of the page the final sections may be too short to ever
      // reach the line, so give the last one the highlight.
      const doc = document.documentElement;
      const scrollBottom = window.scrollY + window.innerHeight;
      if (scrollBottom >= doc.scrollHeight - 2) {
        current = sectionIds[sectionIds.length - 1];
      }

      setActive(current);
    };

    // Measured synchronously rather than inside requestAnimationFrame: rAF is
    // throttled to a standstill while a document is hidden, which would leave
    // the highlight frozen. Reading a handful of rects per scroll is cheap.
    const onScroll = measure;

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [key]);

  return active;
}
