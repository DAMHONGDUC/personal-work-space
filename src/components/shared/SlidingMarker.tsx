"use client";

import { useLayoutEffect, useRef } from "react";
import { AppColors } from "@/lib/design/app-colors";

/** The link each remembered list last marked, so a list drawn afresh on the next page slides on from it. */
const lastMarked = new Map<string, string>();

/**
 * The selected look of a list — the tint and, as a `bar`, the 2px accent rule —
 * drawn once behind the list, so it slides up or down to the item selected
 * next instead of jumping. Place it as the first child of the list it marks;
 * it follows that list's `[aria-current]` link.
 *
 * A list drawn afresh on every page (a series' pages) names a `memory`: the
 * marker then starts on the link the last page marked and slides to this
 * page's. Folding moves the items under it, so whenever the list changes size
 * it glides on to where the item now is — never jumping, which would cut a
 * slide short; a selected item folded out of sight hides it. Nothing slides
 * under `prefers-reduced-motion`.
 */
export function SlidingMarker({
  accent,
  selected,
  memory,
  variant = "bar",
}: {
  accent: string;
  /** What is selected; the marker moves when it changes. */
  selected: string | null | undefined;
  memory?: string;
  variant?: "bar" | "pill";
}) {
  const ref = useRef<HTMLLIElement>(null);

  useLayoutEffect(() => {
    const marker = ref.current;
    const list = marker?.parentElement;
    if (!marker || !list) return;

    function moveTo(item: HTMLElement | null, slide: boolean) {
      if (!marker || !list) return;
      if (!item || item.closest("[inert]")) {
        marker.style.opacity = "0";
        return;
      }
      // "" hands the transition back to the class, which reduced motion turns off.
      marker.style.transition = slide ? "" : "none";
      marker.style.opacity = "1";
      marker.style.transform = `translateY(${item.getBoundingClientRect().top - list.getBoundingClientRect().top}px)`;
      marker.style.height = `${item.offsetHeight}px`;
    }

    const current = () => list.querySelector<HTMLElement>("[aria-current]");
    const href = current()?.getAttribute("href");

    // Start where the last page left it, when that link is in this list and in view.
    const previous = memory && lastMarked.get(memory);
    const from =
      previous && previous !== href
        ? [...list.querySelectorAll<HTMLElement>("a[href]")].find((link) => link.getAttribute("href") === previous)
        : undefined;
    if (from && !from.closest("[inert]")) {
      moveTo(from, false);
      void marker.offsetHeight; // Commit the start before sliding from it.
      moveTo(current(), true);
    } else {
      moveTo(current(), marker.style.opacity === "1");
    }
    if (memory && href) lastMarked.set(memory, href);

    if (typeof ResizeObserver === "undefined") return;
    const resized = new ResizeObserver(() => moveTo(current(), marker.style.opacity === "1"));
    resized.observe(list);
    return () => resized.disconnect();
  }, [selected, memory]);

  return (
    <li
      ref={ref}
      aria-hidden
      data-marker
      className={`pointer-events-none absolute top-0 left-0 w-full opacity-0 transition-[transform,height,opacity] duration-300 ease-(--pf-ease) motion-reduce:transition-none ${
        variant === "bar" ? "-ml-px rounded-r-md border-l-2" : "rounded-lg"
      }`}
      style={
        variant === "bar"
          ? { borderColor: accent, backgroundColor: AppColors.tint(accent, 12) }
          : { backgroundColor: AppColors.tint(accent, 14) }
      }
    />
  );
}
