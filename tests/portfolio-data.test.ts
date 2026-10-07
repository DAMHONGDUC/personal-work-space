import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readCvFile, readCvShared } from "@/lib/cv/cv-disk.mts";
import { periodWithDuration } from "@/lib/cv/cv-period.mts";
import {
  periodStart,
  portfolio,
  portfolioCv as cv,
  portfolioStats,
  titleCase,
  yearsSince,
} from "@/lib/portfolio/portfolio";
import { PORTFOLIO_SECTIONS, SKILL_ICON_IDS, SKILL_ICON_TOOLS } from "@/lib/portfolio/portfolio-model";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const HTTPS = /^https:\/\//;

/** The presentation file as written, without the CV merged in. */
const page = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), ResourceConstant.PORTFOLIO_FILE), "utf8"),
);

describe("the portfolio's CV file", () => {
  it("is the file ResourceConstant names, merged like every CV", () => {
    // Imported statically by a literal path; this keeps that literal, the
    // constant and the merge from drifting apart.
    expect(readCvFile(process.cwd(), ResourceConstant.PORTFOLIO_CV_FILE)).toEqual(cv);
  });

  it("is never offered as a CV", () => {
    expect(ResourceConstant.PORTFOLIO_CV_FILE.startsWith(`${ResourceConstant.CV_DATA_DIR}/`)).toBe(true);
    expect(path.dirname(ResourceConstant.PORTFOLIO_CV_FILE)).not.toBe(ResourceConstant.CV_DATA_DIR);
  });
});

describe("portfolio.json", () => {
  it("is the file ResourceConstant names", () => {
    // The loader imports it by a literal path, which bundling needs; this is
    // what keeps that literal and the constant from drifting apart.
    for (const [key, value] of Object.entries(page)) {
      expect(portfolio[key as keyof typeof portfolio]).toEqual(value);
    }
  });

  it("holds presentation only — every fact comes from the CV", () => {
    // A name, a job or an email typed here would be a second copy that
    // drifts from the CV. The page's own keys are the whole list.
    expect(Object.keys(page).sort()).toEqual(
      ["about", "contact", "greeting", "photo", "projectIcons", "skillIcons", "status", "timezone"].sort(),
    );
    expect(Object.keys(page.about).sort()).toEqual(["learning", "title"]);
    expect(Object.keys(page.contact)).toEqual(["title"]);
  });

  it("gives every skill area of the CV an icon, and no other", () => {
    // Keyed by the CV's own names, so a renamed area shows up here rather
    // than as a card with no icon.
    expect(Object.keys(page.skillIcons).sort()).toEqual(cv.skills.map((skill) => skill.name).sort());

    for (const id of Object.values(page.skillIcons)) {
      expect([...SKILL_ICON_IDS] as string[]).toContain(id);
    }
  });

  it("marks each skill area with a tool that area actually lists", () => {
    // A logo stands for one tool, in that tool's colour; it has to be one the
    // area names, not a loose picture of the topic.
    const wrong = cv.skills
      .filter((skill) => {
        const tool = SKILL_ICON_TOOLS[page.skillIcons[skill.name] as keyof typeof SKILL_ICON_TOOLS];
        return !`${skill.name}, ${skill.items}`.includes(tool);
      })
      .map((skill) => skill.name);

    expect(wrong).toEqual([]);
  });

  it("gives icons only to projects the CV has, from files that ship", () => {
    const names = cv.projects.map((project) => project.name);
    const bad = Object.entries(page.projectIcons as Record<string, string>)
      .filter(
        ([name, src]) =>
          !names.includes(name) ||
          !src.startsWith("/") ||
          !fs.existsSync(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, src)),
      )
      .map(([name, src]) => `${name}: ${src}`);

    expect(bad).toEqual([]);
  });

  it("names something being learnt", () => {
    expect(portfolio.about.learning.length).toBeGreaterThan(0);
  });
});

describe("portfolio and CV", () => {
  it("show the same facts", () => {
    // The point of building one from the other: they cannot disagree.
    expect(portfolio.headline).toBe(cv.aboutMe[0]);
    expect(portfolio.story).toEqual(cv.aboutMe.slice(1));
    expect(portfolio.education).toBe(cv.education);
    expect(portfolio.skills).toBe(cv.skills);
    // Only the length of service is added, counted to the day of the build.
    expect(portfolio.experience).toEqual(
      cv.experience.map((job) => ({ ...job, period: periodWithDuration(job.period) })),
    );
    expect(portfolio.projects).toBe(cv.projects);
    expect(portfolio.name.toUpperCase()).toBe(cv.header.name.toUpperCase());
    expect(portfolio.role).toBe(cv.experience[0].role);
  });

  it("shows its own photo, which ships under public/", () => {
    // A static export has no server to notice a 404, so a missing file would
    // only ever show up as a broken picture in production.
    const file = path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, page.photo);

    expect(page.photo).toMatch(/^\//);
    expect(fs.existsSync(file)).toBe(true);
  });

  it("keeps the CV's photo for the CV", () => {
    // The portfolio has a portrait of its own; the PDF keeps the CV's.
    expect(page.photo.endsWith(`/${cv.header.photo}`)).toBe(false);
  });

  it("shows the CV's About me without repeating a line", () => {
    // The hero leads with the first line and the About section carries on
    // from there, so no sentence appears twice on the page.
    expect(portfolio.story).not.toContain(portfolio.headline);
    expect(portfolio.story.length).toBeGreaterThan(0);
  });

  it("counts the years of experience instead of typing them", () => {
    // Typed, the number goes stale every July; {{years}} is filled at build.
    const written = readCvShared(process.cwd()).aboutMe.join(" ");
    const shown = [portfolio.headline, ...portfolio.story].join(" ");

    expect(written).toContain("{{years}}");
    expect(written).not.toMatch(/\d+\+? years/);
    expect(shown).not.toContain("{{");
    expect(shown).toContain(`${yearsSince(portfolio.careerStart)}+ years`);
  });

  it("takes the email and profiles from the CV's contacts", () => {
    const email = cv.header.contacts.find((contact) => contact.kind === "email");
    const links = cv.header.contacts.filter((contact) => contact.kind === "link");

    expect(portfolio.email).toBe(email?.value);
    expect(portfolio.links.map((link) => link.href)).toEqual(links.map((link) => link.href));
    expect(portfolio.links.map((link) => link.kind)).toEqual(
      expect.arrayContaining(["github", "linkedin"]),
    );
  });

  it("links out over https only", () => {
    const urls = [
      ...portfolio.links.map((link) => link.href),
      ...portfolio.education.flatMap((school) => (school.url ? [school.url] : [])),
      ...portfolio.experience.flatMap((job) => (job.url ? [job.url] : [])),
      ...portfolio.projects.flatMap((project) => project.links.map((link) => link.href)),
    ];

    expect(urls.filter((url) => !HTTPS.test(url))).toEqual([]);
  });

  it("has something in every section the page renders", () => {
    // Each id in PORTFOLIO_SECTIONS is a heading and a header link; an empty
    // list behind one would leave a heading over nothing.
    expect(PORTFOLIO_SECTIONS.map((section) => section.id)).toEqual([
      "about",
      "skills",
      "experience",
      "projects",
      "contact",
    ]);
    expect(portfolio.story.length).toBeGreaterThan(0);
    expect(portfolio.skills.length).toBeGreaterThan(0);
    expect(portfolio.experience.length).toBeGreaterThan(0);
    expect(portfolio.projects.length).toBeGreaterThan(0);
  });
});

describe("derived values", () => {
  it("sets a capitalised name in title case", () => {
    expect(titleCase("DAM HONG DUC")).toBe("Dam Hong Duc");
  });

  it("reads the month a CV period starts", () => {
    expect(periodStart("Jul 2022 – Nov 2022 (5 mos)")).toBe("2022-07");
    expect(periodStart("Sept 2019 – Aug 2023")).toBe("2019-09");
    expect(() => periodStart("sometime in 2022")).toThrow(/Cannot read/);
  });

  it("starts the career at the oldest job", () => {
    expect(portfolio.careerStart).toBe(periodStart(cv.experience[cv.experience.length - 1].period));
  });

  it("counts whole years, and only once the month has come round", () => {
    expect(yearsSince("2022-07", new Date(2026, 5, 30))).toBe(3);
    expect(yearsSince("2022-07", new Date(2026, 6, 1))).toBe(4);
    expect(yearsSince("2030-01", new Date(2026, 0, 1))).toBe(0);
  });

  it("derives every figure from the data", () => {
    const stats = portfolioStats(portfolio, new Date(2026, 8, 28));

    expect(stats.map((stat) => stat.value)).toEqual([
      "4+",
      `${portfolio.experience.length}`,
      `${portfolio.skills.length}`,
      `${portfolio.projects.length}`,
    ]);
  });
});
