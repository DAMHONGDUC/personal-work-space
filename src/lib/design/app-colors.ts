/**
 * Every colour the code chooses, in one place.
 *
 * The palette itself — background, foreground, surface, border, muted — lives
 * in `src/app/globals.css` as CSS variables, because dark mode swaps it with a
 * media query and nothing in JavaScript should know which theme is on. What
 * lives here are the accents: the one colour each section of the site is drawn
 * in, and the tones a guide's note can take. An app's own accent is data, in
 * its JSON file, and is not repeated here.
 *
 * Imports nothing, like ResourceConstant, so it is safe from a client component.
 */
export class AppColors {
  /** The app directory and its privacy policies, on the home page card. */
  static readonly APPS = "#6366f1";

  /**
   * The guides. One colour for the whole section, not one per guide: a guide
   * arriving in its own colour made the set read as unrelated pages.
   */
  static readonly DOCS = "#0ea5e9";

  /** The effects library. */
  static readonly EFFECTS = "#f43f5e";

  /**
   * The portfolio. Used sparingly — a rule, a dot, a hover — and never as a
   * gradient: the page should read as designed, not generated.
   */
  static readonly PORTFOLIO = "#10b981";

  /** The CV card on the home page. */
  static readonly CV = "#0ea5e9";

  /** A guide's `note` block, by tone. */
  static readonly NOTE_INFO = "#0ea5e9";
  static readonly NOTE_WARNING = "#f59e0b";

  /**
   * `color` at `percent` strength over transparent — how every tint, wash and
   * tinted border on the site is made, so they all mix the same way.
   *
   * @example AppColors.tint(AppColors.DOCS, 14) // "color-mix(in oklab, #0ea5e9 14%, transparent)"
   */
  static tint(color: string, percent: number): string {
    return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
  }

  // Static members only: the class is a namespace, and there is nothing to construct.
  private constructor() {}
}
