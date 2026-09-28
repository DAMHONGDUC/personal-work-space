/**
 * The page-level gaps, in one place.
 *
 * Every page starts under the sticky header, and each one used to pick its own
 * top padding — 80px here, 40px there, 96px on the portfolio — so the site
 * never lined up. Anything that is the first thing under the header takes
 * PAGE_TOP; change it here and every page moves together.
 *
 * Full Tailwind class strings, never built by concatenation, so the compiler
 * can see them in this file.
 */
export class AppSpacings {
  /** Between the sticky header and the first content of any page or hero. */
  static readonly PAGE_TOP = "pt-6 sm:pt-8";
  /** Between the last content and the footer. */
  static readonly PAGE_BOTTOM = "pb-20";
  /** Between a full-width hero and the page body under it. */
  static readonly AFTER_HERO = "pt-14";
  /** Between a hero's own content and its bottom border. */
  static readonly HERO_BOTTOM = "pb-12";

  /**
   * The one gap on the portfolio: between the hero and the first section, and
   * between every two sections. Sections carry no padding of their own — the
   * page stacks its blocks with this gap — so the two can never differ.
   */
  static readonly PORTFOLIO_GAP = "gap-16";

  // Static members only: the class is a namespace, and there is nothing to construct.
  private constructor() {}
}
