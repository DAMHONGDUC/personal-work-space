/**
 * The shape of the CV data file — the single source of truth for the CV.
 *
 * Text fields hold plain text, never LaTeX: the renderer escapes the special
 * characters and converts typography itself. Write "&" and "get_it", not "\&"
 * and "get\_it". An en dash (–) becomes LaTeX's "--", an em dash (—) becomes
 * "---", and a middle dot (·) becomes a maths "$\cdot$" separator.
 *
 * Kept free of imports so both the Next.js app and the plain-Node build script
 * can pull the types in.
 */

export type ContactKind = "email" | "phone" | "link";

export type Contact = {
  kind: ContactKind;
  /** The visible text. */
  value: string;
  /** Target URL. Optional for `email`, which defaults to `mailto:<value>`. */
  href?: string;
};

export type Education = {
  institution: string;
  /** The institution's website. Links its name in the PDF and on the portfolio. */
  url?: string;
  location: string;
  period: string;
  degree: string;
};

/** One line of the Skills list: "**name:** items". */
export type Skill = {
  name: string;
  items: string;
};

/** A block of work inside one job, e.g. "Mobile App" or "Web". */
export type ExperienceGroup = {
  title: string;
  /** Stack and team size, shown as the first bullet. */
  meta: string;
  bullets: string[];
};

export type Experience = {
  company: string;
  /** The company's website. Links its name in the PDF and on the portfolio. */
  url?: string;
  role: string;
  /** Hybrid / Onsite / Remote. */
  arrangement: string;
  location: string;
  period: string;
  groups: ExperienceGroup[];
  /** Trailing bullet with a bold lead-in, e.g. "Process: Agile — …". */
  note?: { label: string; text: string };
};

export type Project = {
  name: string;
  description: string;
  links: { label: string; href: string }[];
};

export type Cv = {
  /**
   * What the CV switcher calls this version — "Full profile", "Flutter focus".
   * Several CVs live side by side in the data directory, each cut for a
   * different reader, and this is the only thing telling them apart on the
   * page, so it names the angle rather than the file.
   */
  label: string;
  /** ISO date shown on the site as the CV's "last updated". */
  lastUpdated: string;
  header: {
    name: string;
    /**
     * Filename inside cv/assets. The CV prints it at 3.2cm, so a JPEG around
     * 800px wide is already past what any printer resolves — anything larger
     * just inflates the PDF.
     */
    photo: string;
    contacts: Contact[];
  };
  aboutMe: string[];
  education: Education[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
};

/** One CV's compiled PDF, as the page links to it. A build artifact. */
export type CvPdf = {
  /** Site-relative URL, without the base path. */
  url: string;
  /** What the browser saves the file as, rather than the `cv.pdf` it is served as. */
  fileName: string;
  sizeKb: number;
};

/** One rasterised page of a CV, as written by `npm run cv:pdf`. */
export type CvPage = {
  url: string;
  width: number;
  height: number;
};

/**
 * One CV as the page needs it: the content, plus the artefacts the build
 * produced for it. Both may be missing — a CV whose PDF has not been compiled
 * still appears in the switcher, and says so.
 *
 * These three live here rather than beside the loader in cv.ts because the
 * switcher is a client component: cv.ts reads the filesystem, and importing it
 * even for a type drags node:fs into the browser bundle.
 */
export type CvVersion = {
  slug: string;
  label: string;
  data: Cv;
  pdf: CvPdf | null;
  pages: CvPage[];
};
