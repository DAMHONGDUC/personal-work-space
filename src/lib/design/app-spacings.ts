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
   * Above and below each portfolio section, so two sections sit twice this
   * apart. The portfolio's hero ends on the same half-gap, so the hero and
   * the first section are spaced like any two sections.
   */
  static readonly PORTFOLIO_SECTION = "py-8";
  static readonly PORTFOLIO_HERO_BOTTOM = "pb-8";

  // Static members only: the class is a namespace, and there is nothing to construct.
  private constructor() {}
}
