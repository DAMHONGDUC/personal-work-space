/**
 * The shape of the portfolio.
 *
 * Every fact on the page — name, role, story, education, skills, jobs,
 * projects, email, profiles, the photo — comes from the default CV
 * (`ResourceConstant.CV_DATA_FILE`, cv_full.json), so the portfolio and the CV
 * can never disagree. `src/data/portfolio.json` holds only what a CV has no
 * place for: the greeting, the availability line, an icon per skill area and
 * the like.
 *
 * Kept apart from the loader, which reads the CV off disk, so a client
 * component can import the types and the section list.
 */
import type { Education, Experience, Project, Skill } from "@/lib/cv/cv-types";

/**
 * A file under `public/`, written with its leading slash (`/portfolio/…`). The
 * test suite checks each one exists, because a static export has no server to
 * notice a 404.
 */
export type PublicPath = string;

/**
 * The icon a skill area is drawn with. The ids are the page's own; which mark
 * each one is lives in `SkillIcon`, so the JSON never names an icon library.
 */
export const SKILL_ICON_IDS = ["android", "flutter", "react", "backend", "web", "ai", "release"] as const;

export type SkillIconId = (typeof SKILL_ICON_IDS)[number];

/** The shape of `src/data/portfolio.json`: presentation, never a fact. */
export type PortfolioPage = {
  /** The greeting at the top of the page, e.g. `Hi, I'm Duc`. */
  greeting: string;
  /** Availability, next to a green dot. Omit it and the dot goes too. */
  status?: string;
  about: {
    title: string;
    /** What is being learnt right now, shown as chips on its own tile. */
    learning: string[];
  };
  /**
   * An icon for every skill area of the CV, keyed by the area's name exactly as
   * the CV writes it. A test fails if an area has none, or if a key names an
   * area the CV no longer has.
   */
  skillIcons: Record<string, SkillIconId>;
  /** Shown under the location, e.g. `GMT+7`. */
  timezone: string;
  contact: {
    /** The line above the email button. */
    title: string;
  };
};

/** A profile link, picked out of the CV's contacts by its host. */
export type PortfolioLink = {
  /** Picks the brand icon. The label is what a screen reader hears. */
  kind: "github" | "linkedin" | "website";
  label: string;
  href: string;
};

/** The portfolio as the page draws it: the CV's facts plus the page's own copy. */
export type Portfolio = PortfolioPage & {
  /** The CV prints the name in capitals; the page sets it in title case. */
  name: string;
  /** The CV's photo, as served from public/. */
  photo: PublicPath;
  /** The current role: the newest job's title. */
  role: string;
  /** The CV's About me, first paragraph first — it doubles as the hero's lead. */
  aboutMe: string[];
  /** Where the newest job is. */
  location: string;
  education: Education[];
  skills: Skill[];
  /** Newest first, as on the CV. */
  experience: Experience[];
  projects: Project[];
  email: string;
  links: PortfolioLink[];
  /**
   * `YYYY-MM` the oldest job started, read off its period. The
   * years-of-experience figure is computed from it at build time.
   */
  careerStart: string;
};

/**
 * The page's sections, in order. Ids are anchors, so the header's nav and the
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
