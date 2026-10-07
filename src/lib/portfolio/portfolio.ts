import source from "@/data/cv/portfolio/portfolio.json";
import page from "@/data/portfolio.json";
import { SHARED } from "@/lib/cv/cv";
import { mergeCv } from "@/lib/cv/cv-merge.mts";
import { periodStart, periodWithDuration, yearsSince } from "@/lib/cv/cv-period.mts";
import type { Cv, CvSource } from "@/lib/cv/cv-types";
import type {
  Portfolio,
  PortfolioLink,
  PortfolioPage,
  PortfolioStat,
} from "@/lib/portfolio/portfolio-model";

export type { Portfolio } from "@/lib/portfolio/portfolio-model";
export { periodStart, yearsSince } from "@/lib/cv/cv-period.mts";

/** `DAM HONG DUC` -> `Dam Hong Duc`. */
export function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

/** The CV's link contacts that the page shows as profiles, by host. */
function profileLinks(source: Cv): PortfolioLink[] {
  return source.header.contacts
    .filter((contact) => contact.kind === "link" && contact.href)
    .map((contact) => {
      const href = contact.href as string;
      const host = new URL(href).hostname.replace(/^www\./, "");

      if (host === "github.com") return { kind: "github", label: "GitHub", href };
      if (host === "linkedin.com") return { kind: "linkedin", label: "LinkedIn", href };
      return { kind: "website", label: contact.value, href };
    });
}

/**
 * The portfolio: `page` for the presentation, `source` for every fact.
 * Throws if the CV lacks something the page cannot do without.
 */
export function buildPortfolio(source: Cv, extras: PortfolioPage): Portfolio {
  const [newest] = source.experience;
  const oldest = source.experience[source.experience.length - 1];
  const email = source.header.contacts.find((contact) => contact.kind === "email")?.value;

  if (!newest || !oldest) throw new Error("The CV has no experience to show on the portfolio");
  if (!email) throw new Error("The CV has no email contact for the portfolio");
  if (source.aboutMe.length < 2) {
    throw new Error("The CV's About me needs a lead line for the hero and the rest for the About section");
  }

  const careerStart = periodStart(oldest.period);

  return {
    ...extras,
    name: titleCase(source.header.name),
    role: newest.role,
    // The CV's own About me, split: the first line leads the hero and the rest
    // opens the About section, so no sentence is shown twice.
    headline: source.aboutMe[0],
    story: source.aboutMe.slice(1),
    location: newest.location,
    education: source.education,
    skills: source.skills,
    experience: source.experience.map((job) => ({ ...job, period: periodWithDuration(job.period) })),
    projects: source.projects,
    email,
    links: profileLinks(source),
    careerStart,
  };
}

/**
 * The portfolio's facts: `ResourceConstant.PORTFOLIO_CV_FILE`, a file in the
 * CV version format, merged with the same shared parts as every CV. Static
 * imports, because bundling needs a literal path; a test asserts both name the
 * same files as the constants.
 */
export const portfolioCv = mergeCv(source as CvSource, SHARED);

/** The portfolio as the site shows it, with `ResourceConstant.PORTFOLIO_FILE`. */
export const portfolio = buildPortfolio(portfolioCv, page as PortfolioPage);

/**
 * The figures under the hero, derived from the data rather than typed into it,
 * so a new job or project in the CV updates the count on its own.
 */
export function portfolioStats(source: Portfolio = portfolio, now?: Date): PortfolioStat[] {
  const count = (n: number, one: string, many: string) => ({ value: `${n}`, label: n === 1 ? one : many });

  return [
    { value: `${yearsSince(source.careerStart, now)}+`, label: "years building apps" },
    count(source.experience.length, "company", "companies"),
    count(source.skills.length, "skill area", "skill areas"),
    count(source.projects.length, "personal project", "personal projects"),
  ];
}
