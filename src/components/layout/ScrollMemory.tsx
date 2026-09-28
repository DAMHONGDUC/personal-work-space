"use client";

import { usePathname } from "next/navigation";
import { useScrollMemory } from "@/hooks/scroll/useScrollMemory";

/**
 * Remembers the scroll position of each page and restores it on Back.
 *
 * Mounted once in the root layout so it survives navigation: it watches the
 * path rather than being remounted by it, which is what lets it save the
 * position of the page being left.
 */
export function ScrollMemory() {
  useScrollMemory(usePathname());

  return null;
}
