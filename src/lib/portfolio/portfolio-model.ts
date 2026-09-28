/**
 * The shape of the portfolio — `src/data/portfolio.json`.
 *
 * One file, one page, one language: the portfolio was a standalone site in
 * English before it moved here, and it is the publisher's introduction rather
 * than a guide, so nothing about it is translated.
 *
 * Kept apart from the loader so a client component can import the types
 * without dragging the JSON into the browser bundle a second time.
 */

/**
 * A file under `public/`, written with its leading slash (`/portfolio/…`). The
 * test suite checks each one exists, because a static export has no server to
 * notice a 404.
 */
export type PublicPath = string;

export type PortfolioLink = {
  /** Picks the icon. The label is what a screen reader hears. */
  kind: "github" | "linkedin" | "figma" | "email" | "website";
  label: string;
  href: string;
};

export type PortfolioSkill = {
  label: string;
  logo: PublicPath;
  /** The technology's own site, opened from the chip. */
  url: string;
};

export type PortfolioJob = {
  company: string;
  /**
   * The employer's logo. Optional: without one the card draws the company's
   * initials, which beats the wrong logo — the old portfolio shipped template
   * logos under real company names.
   */
  logo?: PublicPath;
  role: string;
  /** Printed as written, e.g. `Jan 2023 – now`. */
  period: string;
  points: string[];
};

export type PortfolioProject = {
  name: string;
  description: string;
  image: PublicPath;
  technologies: string[];
  /** At least one of the two is required; a project card with no way out is a dead end. */
  source?: string;
  demo?: string;
};

export type Portfolio = {
  name: string;
  /** The greeting at the top of the page, e.g. `Hi, I'm Duc`. */
  greeting: string;
  /** One line under the name, e.g. `Mobile Developer`. */
  role: string;
  headline: string;
  location: string;
  /** Availability, next to a green dot. Omit it and the dot goes too. */
  status?: string;
  /**
   * `YYYY-MM` of the first full-time role. The years-of-experience figure is
   * computed from it at build time, so the page never states a stale number.
   */
  careerStart: string;
  avatar: PublicPath;
  links: PortfolioLink[];
  about: {
    title: string;
    image: PublicPath;
    body: string[];
    /** What is being learnt right now, shown as chips on its own tile. */
    learning: string[];
  };
  skills: PortfolioSkill[];
  /** Newest first — a portfolio leads with what the reader cares about. */
  experience: PortfolioJob[];
  projects: PortfolioProject[];
  contact: {
    title: string;
    email: string;
  };
};

/**
 * The page's sections, in order. Ids are anchors, so the in-page nav and the
 * headings are built from this one list and cannot disagree.
 */
export const PORTFOLIO_SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

/** One figure in the strip under the hero. */
export type PortfolioStat = { value: string; label: string };

export type PortfolioSectionId = (typeof PORTFOLIO_SECTIONS)[number]["id"];
