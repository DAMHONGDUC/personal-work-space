"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A `<section>` that plays its entrance when it scrolls into view: the
 * heading rises, its rule draws, then its cards rise one after another (the
 * `.pf-head`, `.pf-rule` and `.pf-item` rules in globals.css).
 *
 * Works in every browser, through IntersectionObserver rather than CSS
 * scroll timelines. Only a section that starts below the fold is hidden
 * first, so nothing on screen ever blinks out; with no JavaScript, or with
 * reduced motion, `data-reveal` is never set and everything is simply there.
 * It writes the attribute directly, so the page never re-renders for it.
 */
export function RevealSection({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen (a short page, an anchor, a restored scroll): leave it.
    if (section.getBoundingClientRect().top < window.innerHeight) return;

    section.dataset.reveal = "hidden";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Start once a sliver of the section is in, not at its very first pixel.
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
