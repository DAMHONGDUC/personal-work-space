import page from "@/data/portfolio.json";
import { cv } from "@/lib/cv/cv";
import type { Cv } from "@/lib/cv/cv-types";
import type {
  Portfolio,
  PortfolioLink,
  PortfolioPage,
  PortfolioStat,
} from "@/lib/portfolio/portfolio-model";

export type { Portfolio } from "@/lib/portfolio/portfolio-model";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** `DAM HONG DUC` -> `Dam Hong Duc`. */
export function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

/**
 * `Jul 2022 – Nov 2022 (5 mos)` -> `2022-07`: the month a period starts.
 * Throws on a period it cannot read, so a typo in the CV fails the build
 * rather than printing a wrong number of years.
 */
export function periodStart(period: string): string {
  const match = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/.exec(period.trim());
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1;

  if (!match || month === -1) {
    throw new Error(`Cannot read the start of the CV period "${period}"`);
  }

  return `${match[2]}-${String(month + 1).padStart(2, "0")}`;
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
  if (!source.portfolioAbout?.length) {
    throw new Error("The CV has no portfolioAbout, the portfolio's own introduction");
  }

  return {
    ...extras,
    name: titleCase(source.header.name),
    role: newest.role,
    headline: source.aboutMe[0],
    story: source.portfolioAbout,
    location: newest.location,
    education: source.education,
    skills: source.skills,
    experience: source.experience,
    projects: source.projects,
    email,
    links: profileLinks(source),
    careerStart: periodStart(oldest.period),
  };
}

/**
 * The portfolio as the site shows it, built from the default CV and
 * `ResourceConstant.PORTFOLIO_FILE`. A static import: bundling needs a
 * literal path, and a test asserts it names the same file as the constant.
 */
export const portfolio = buildPortfolio(cv, page as PortfolioPage);

/** Whole years from a `YYYY-MM` start to `now`. */
export function yearsSince(start: string, now: Date = new Date()): number {
  const [year, month] = start.split("-").map(Number);
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);

  return Math.max(0, Math.floor(months / 12));
}

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
    count(source.projects.length, "project", "projects"),
  ];
}
