/**
 * Formatting shared across scopes: dates for the app policies and the guides,
 * names for the portfolio and the CV's cover letter.
 *
 * It lives on its own rather than in a loader because the guides render inside a
 * client component — importing it from `@/lib/apps` would drag `node:fs` into
 * the browser bundle.
 */
export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** `DAM HONG DUC` -> `Dam Hong Duc`. */
export function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
