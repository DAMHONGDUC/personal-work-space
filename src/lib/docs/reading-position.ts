/**
 * Where a reader left a guide, kept in their own browser.
 *
 * Stored per guide as the section they were in and how far into it, not as a
 * page offset: the page's length changes with the language and the window, a
 * section's id does not. Only this browser ever sees it — the site is static
 * and sends it nowhere.
 */

export type ReadingPosition = {
  /** Id of the section the reader was in. */
  section: string;
  /** How far past the section's top, in pixels, the reader had scrolled. */
  offset: number;
  /** They reached the end of the guide; there is nothing to pick up. */
  done: boolean;
};

const key = (slug: string) => `docs-position:${slug}`;

/** The raw stored value, or null when there is none or storage is unavailable. */
export function readStoredPosition(slug: string): string | null {
  try {
    return window.localStorage.getItem(key(slug));
  } catch {
    // Safari in private mode throws; the feature is simply off there.
    return null;
  }
}

/** A stored value, checked; anything malformed reads as nothing saved. */
export function parsePosition(raw: string | null): ReadingPosition | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<ReadingPosition>;
    if (typeof value.section !== "string" || typeof value.offset !== "number") return null;
    return { section: value.section, offset: Math.max(0, value.offset), done: value.done === true };
  } catch {
    return null;
  }
}

export function writePosition(slug: string, position: ReadingPosition) {
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(position));
  } catch {
    /* see readStoredPosition */
  }
}
