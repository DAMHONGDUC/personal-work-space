import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cv } from "@/lib/cv/cv";
import {
  periodStart,
  portfolio,
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
      ["about", "contact", "greeting", "skillIcons", "status", "timezone"].sort(),
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

  it("names something being learnt", () => {
    expect(portfolio.about.learning.length).toBeGreaterThan(0);
  });
});

describe("portfolio and CV", () => {
  it("show the same facts", () => {
    // The point of building one from the other: they cannot disagree.
    expect(portfolio.headline).toBe(cv.aboutMe[0]);
    expect(portfolio.story).toBe(cv.portfolioAbout);
    expect(portfolio.education).toBe(cv.education);
    expect(portfolio.skills).toBe(cv.skills);
    expect(portfolio.experience).toBe(cv.experience);
    expect(portfolio.projects).toBe(cv.projects);
    expect(portfolio.name.toUpperCase()).toBe(cv.header.name.toUpperCase());
    expect(portfolio.role).toBe(cv.experience[0].role);
  });

  it("shows the CV's one photo, and ships no other", () => {
    // One file serves both: the LaTeX build copies it into the PDF, and the
    // site serves it from public/.
    const file = path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, portfolio.photo);

    expect(portfolio.photo.endsWith(`/${cv.header.photo}`)).toBe(true);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, "portfolio"))).toBe(false);
  });

  it("tells a longer story than the CV's short introduction", () => {
    // Two introductions, one file: the CV prints aboutMe, the portfolio shows
    // portfolioAbout — two full paragraphs, and not the CV's lines again.
    expect(cv.portfolioAbout).toHaveLength(2);
    expect(cv.portfolioAbout?.join(" ").length).toBeGreaterThan(cv.aboutMe.join(" ").length * 2);
    for (const paragraph of cv.portfolioAbout ?? []) {
      expect(cv.aboutMe).not.toContain(paragraph);
    }
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
