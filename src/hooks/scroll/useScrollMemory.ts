"use client";

import { useEffect, useRef } from "react";

/** Where one path was left, for as long as the tab lives. */
const key = (pathname: string) => `scroll:${pathname}`;

/**
 * Frames to keep correcting for after a back navigation.
 *
 * A restored page arrives in stages — the router commits, then fonts and images
 * settle — so on the first frame the document is often still shorter than the
 * offset being restored, and a single scrollTo would land short of it.
 */
const FRAMES = 20;

/**
 * Frames the position has to hold before we stop correcting. The router does
 * its own scrolling around a navigation, so landing once and letting go can
 * lose the race with a scroll-to-top that arrives a frame later.
 */
const HOLD = 3;

/** Browsers report fractional offsets on scaled displays; 1px is the same place. */
const TOLERANCE = 1;

function read(pathname: string): number {
  try {
    const stored = window.sessionStorage.getItem(key(pathname));
    const value = stored === null ? 0 : Number(stored);

    return Number.isFinite(value) ? value : 0;
  } catch {
    // Safari in private mode throws on sessionStorage. Losing the position is
    // the old behaviour, so there is nothing to report.
    return 0;
  }
}

function write(pathname: string, offset: number) {
  try {
    window.sessionStorage.setItem(key(pathname), String(offset));
  } catch {
    /* see read() */
  }
}

/**
 * Puts the reader back where they were when they press Back.
 *
 * Going from the guide index into a guide and back again should return to the
 * card you opened, not to the top of a list you have already scrolled past —
 * and on a static export there is no server round trip to hide the jump.
 *
 * Only back and forward restore. A fresh navigation still starts at the top,
 * which is what makes the difference legible: the scroll position belongs to
 * the history entry, not to the URL.
 */
export function useScrollMemory(pathname: string) {
  // Kept in refs rather than state: none of it should cause a render.
  const offset = useRef(0);
  const current = useRef(pathname);
  const returning = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      offset.current = window.scrollY;
    };

    // pagehide covers a reload and a hard navigation away, where the effect
    // below never gets to run.
    const onLeave = () => write(current.current, offset.current);
    const onPopState = () => {
      returning.current = true;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    const from = current.current;
    const back = returning.current;

    // A popstate that did not change the path was a hash link or a replace, and
    // the flag must not survive into the next navigation.
    returning.current = false;

    if (from === pathname) return;

    write(from, offset.current);
    current.current = pathname;
    offset.current = 0;

    // An anchored url already names where to be, and the router scrolls there.
    if (!back || window.location.hash) return;

    const target = read(pathname);
    if (target <= 0) return;

    const root = document.documentElement;
    // scroll-behavior: smooth would animate the restore, which reads as the
    // page scrolling itself while you look at it.
    const behavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    let frames = 0;
    let held = 0;
    let raf = 0;

    const step = () => {
      const reachable = Math.max(root.scrollHeight - window.innerHeight, 0);
      const goal = Math.min(target, reachable);

      if (Math.abs(window.scrollY - goal) > TOLERANCE) {
        window.scrollTo(0, goal);
        held = 0;
      } else if (reachable >= target) {
        // In place, and the document is tall enough to mean it — the short-page
        // case is where a single scrollTo lands halfway up the list.
        held += 1;
      }

      if (held >= HOLD || frames++ >= FRAMES) {
        root.style.scrollBehavior = behavior;
        return;
      }

      raf = window.requestAnimationFrame(step);
    };

    step();

    return () => {
      window.cancelAnimationFrame(raf);
      root.style.scrollBehavior = behavior;
    };
  }, [pathname]);
}
