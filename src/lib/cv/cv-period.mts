/**
 * Reads the `period` strings of the CV: `Jul 2022 – Nov 2022`, `Oct 2024 – now`.
 *
 * Import-free, like cv-latex.mts, so the plain-Node LaTeX build and the site
 * share one reading of a period and print the same length of service.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** `Sept 2019` -> `2019-09`, or null when the text is not a month and year. */
function readMonth(text: string): string | null {
  const match = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/.exec(text.trim());
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1;

  return match && month !== -1 ? `${match[2]}-${String(month + 1).padStart(2, "0")}` : null;
}

/**
 * `Jul 2022 – Nov 2022` -> `2022-07`: the month a period starts.
 * Throws on a period it cannot read, so a typo in the CV fails the build
 * rather than printing a wrong number of years.
 */
export function periodStart(period: string): string {
  const start = readMonth(period.split("–")[0]);

  if (!start) {
    throw new Error(`Cannot read the start of the CV period "${period}"`);
  }

  return start;
}

/** `2024-10` and `2026-10` -> 25: both months count, as a CV counts them. */
function monthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/** Whole years from a `YYYY-MM` start to `now`. */
export function yearsSince(start: string, now: Date = new Date()): number {
  const [year, month] = start.split("-").map(Number);
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);

  return Math.max(0, Math.floor(months / 12));
}

/** 23 -> `1 yr 11 mos`, 24 -> `2 yrs`, 5 -> `5 mos`. */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "yr" : "yrs"}` : "",
    rest > 0 ? `${rest} ${rest === 1 ? "mo" : "mos"}` : "",
  ];

  return parts.filter(Boolean).join(" ");
}

/**
 * `Oct 2024 – now` -> `Oct 2024 – now (2 yrs 1 mo)`, counted to `now`.
 *
 * The length is computed, never typed: a job that is still running would
 * otherwise print last month's figure. Throws on a period it cannot read.
 */
export function periodWithDuration(period: string, now: Date = new Date()): string {
  const [from, to] = period.split("–");
  const start = from === undefined ? null : readMonth(from);
  const end =
    to?.trim() === "now"
      ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      : to === undefined
        ? null
        : readMonth(to);

  if (!start || !end || monthsBetween(start, end) < 1) {
    throw new Error(`Cannot read the CV period "${period}" as "Mon YYYY – Mon YYYY" or "Mon YYYY – now"`);
  }

  return `${period.trim()} (${formatDuration(monthsBetween(start, end))})`;
}
