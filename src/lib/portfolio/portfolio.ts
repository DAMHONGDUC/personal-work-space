import data from "@/data/portfolio.json";
import type { Portfolio, PortfolioStat } from "@/lib/portfolio/portfolio-model";

export type { Portfolio } from "@/lib/portfolio/portfolio-model";

/**
 * The portfolio, as written in `ResourceConstant.PORTFOLIO_FILE`.
 *
 * A static import rather than a read off disk: it is one file, and bundling
 * needs a literal path — `tests/portfolio-data.test.ts` asserts this and the
 * constant name the same file, so moving it is caught.
 */
export const portfolio = data as Portfolio;

/** Whole years from a `YYYY-MM` start to `now`. */
export function yearsSince(start: string, now: Date = new Date()): number {
  const [year, month] = start.split("-").map(Number);
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);

  return Math.max(0, Math.floor(months / 12));
}

/**
 * The figures under the hero, derived from the data rather than typed into it,
 * so adding a project or a skill updates the count on its own.
 */
export function portfolioStats(source: Portfolio = portfolio, now?: Date): PortfolioStat[] {
  return [
    { value: `${yearsSince(source.careerStart, now)}+`, label: "years building apps" },
    { value: `${source.skills.length}`, label: "technologies" },
    { value: `${source.experience.length}`, label: "companies" },
    { value: `${source.projects.length}`, label: "shipped projects" },
  ];
}
