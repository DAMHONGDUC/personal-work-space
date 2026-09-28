/**
 * The site's type scale, as named Tailwind class strings.
 *
 * Headings, leads and captions were written out by hand in every component, and
 * the same role drifted: a page title here was a size larger than there. Each
 * role is named once here; a component combines one with its own layout
 * classes (`${AppTextStyles.CAPTION} mt-6`) but never restates the size, weight or
 * colour of a role that exists.
 *
 * Full class strings, never built by concatenation, so Tailwind can see them in
 * this file. Colour here is always a palette name (`text-muted`), never a hex.
 */
export class AppTextStyles {
  // Headings, largest first.

  /** The h1 of a page that opens with a PageIntro. */
  static readonly PAGE_TITLE = "text-4xl font-semibold tracking-tight sm:text-5xl";
  /** The h1 inside a hero: a guide or a privacy policy. */
  static readonly HERO_TITLE = "text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.15]";
  /** The h1 of a reference tool's one-line header. */
  static readonly COMPACT_TITLE = "text-2xl font-semibold tracking-tight";
  /** A large card's title, e.g. a guide in the index. */
  static readonly CARD_TITLE = "text-xl font-semibold tracking-tight";
  /** A small card's title, e.g. a hub card or a job. */
  static readonly CARD_TITLE_SM = "text-lg font-semibold tracking-tight";

  // Running text.

  /** The paragraph under a page title. */
  static readonly LEAD = "text-lg leading-8 text-muted";
  /** Body copy in a secondary voice. */
  static readonly BODY = "text-base leading-7 text-muted";
  /** A card's description. */
  static readonly BODY_SM = "text-sm leading-6 text-muted";
  /** A short secondary line: a count, a hint, a nav link. */
  static readonly SMALL = "text-sm text-muted";
  /** Metadata: dates, counts, the footer line of a card. */
  static readonly CAPTION = "text-xs text-muted";

  // Labels.

  /** The uppercase label above a group: "Jump to a section", a shelf name. */
  static readonly EYEBROW = "text-xs font-medium uppercase tracking-wider text-muted";
  /** A code-like label: an error code, a project's index number. */
  static readonly MONO_LABEL = "font-mono text-sm text-muted";

  // Static members only: the class is a namespace, and there is nothing to construct.
  private constructor() {}
}
