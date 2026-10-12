"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  parsePosition,
  readStoredPosition,
  writePosition,
  type ReadingPosition,
} from "@/lib/docs/reading-position";
import { scrollToSection } from "@/lib/scroll/scroll-to-section";

/** Line under the sticky header where a heading counts as reached, as in useActiveSection. */
const HEADER_LINE = 120;

/** Wait this long after the last scroll before saving, so a scroll saves once. */
const SAVE_DELAY_MS = 400;

/**
 * What was stored when the guide was opened, read once per visit. Later saves
 * must not change it: the offer is to go back to where the reader was when
 * they arrived, not to where they are now.
 */
const arrival = new Map<string, string | null>();

const subscribe = () => () => {};

/** Where the reader is now: the last section whose heading passed the line, and how far into it. */
function measure(sectionIds: string[]): ReadingPosition | null {
  let current: HTMLElement | null = null;

  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (element && element.getBoundingClientRect().top <= HEADER_LINE) current = element;
  }
  if (!current) return null;

  const doc = document.documentElement;
  return {
    section: current.id,
    offset: Math.max(0, Math.round(HEADER_LINE - current.getBoundingClientRect().top)),
    done: window.scrollY + window.innerHeight >= doc.scrollHeight - 2,
  };
}

/**
 * Remembers where the reader is in a guide, and offers it back next time.
 *
 * Saves on scroll and when the page is left. Returns the position found on
 * arrival — `null` once the reader has moved on to it, dismissed it, or when
 * there is nothing worth offering (the first section, or a guide read to the
 * end) — and the two things the offer can do.
 */
export function useReadingPosition(slug: string, sectionIds: string[]) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      if (!arrival.has(slug)) arrival.set(slug, readStoredPosition(slug));
      return arrival.get(slug) ?? null;
    },
    () => null,
  );
  const saved = useMemo(() => parsePosition(raw), [raw]);
  const [closed, setClosed] = useState(false);
  const [reached, setReached] = useState(-1);

  // Depend on the joined key so a new array with the same ids does not re-run.
  const key = sectionIds.join("|");

  useEffect(() => {
    const ids = key ? key.split("|") : [];
    let timer = 0;

    const save = () => {
      const now = measure(ids);
      if (!now) return;
      writePosition(slug, now);
      setReached(ids.indexOf(now.section));
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(save, SAVE_DELAY_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      // The next visit reads the storage afresh.
      arrival.delete(slug);
    };
  }, [slug, key]);

  const index = saved ? sectionIds.indexOf(saved.section) : -1;
  const offer = saved && !saved.done && index > 0 && !closed && reached < index ? saved : null;

  const resume = useCallback(() => {
    if (!saved) return;
    setClosed(true);
    scrollToSection(saved.section, () => {
      // Put the section's top back where it was: `offset` above the line.
      const section = document.getElementById(saved.section);
      if (!section) return;
      const top = section.getBoundingClientRect().top;
      window.scrollBy({ top: top - (HEADER_LINE - saved.offset), behavior: "instant" });
    });
  }, [saved]);

  const dismiss = useCallback(() => setClosed(true), []);

  return { offer, resume, dismiss };
}
