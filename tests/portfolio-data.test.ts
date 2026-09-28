import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { portfolio, portfolioStats, yearsSince } from "@/lib/portfolio/portfolio";
import { PORTFOLIO_SECTIONS } from "@/lib/portfolio/portfolio-model";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const HTTPS = /^https:\/\//;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Every image the page draws, with where in the data it came from. */
function images(): [string, string][] {
  return [
    ["avatar", portfolio.avatar],
    ["about.image", portfolio.about.image],
    ...portfolio.skills.map((skill): [string, string] => [`skills.${skill.label}`, skill.logo]),
    ...portfolio.experience.flatMap((job): [string, string][] =>
      job.logo === undefined ? [] : [[`experience.${job.company}`, job.logo]],
    ),
    ...portfolio.projects.map((project): [string, string] => [`projects.${project.name}`, project.image]),
  ];
}

describe("portfolio.json", () => {
  it("is the file ResourceConstant names", () => {
    // The loader imports it by a literal path, which bundling needs; this is
    // what keeps that literal and the constant from drifting apart.
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), ResourceConstant.PORTFOLIO_FILE), "utf8"),
    );

    expect(portfolio).toEqual(onDisk);
  });

  it("draws only images that ship under public/portfolio", () => {
    // A static export has no server to notice a 404, so a missing file would
    // only ever show up as a broken picture in production.
    const bad = images()
      .filter(
        ([, src]) =>
          !src.startsWith(`/${ResourceConstant.PORTFOLIO_ASSETS_DIR.replace(/^public\//, "")}/`) ||
          !fs.existsSync(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, src)),
      )
      .map(([at, src]) => `${at}: ${src}`);

    expect(bad).toEqual([]);
  });

  it("ships no image that nothing draws", () => {
    const used = new Set(images().map(([, src]) => src));
    const assetsDir = path.join(process.cwd(), ResourceConstant.PORTFOLIO_ASSETS_DIR);
    const onDisk = fs
      .readdirSync(assetsDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) =>
        `/${path.relative(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR), path.join(entry.parentPath, entry.name))}`,
      );

    expect(onDisk.filter((file) => !used.has(file))).toEqual([]);
  });

  it("links out over https only", () => {
    const urls = [
      ...portfolio.links.filter((link) => link.kind !== "email").map((link) => link.href),
      ...portfolio.skills.map((skill) => skill.url),
      ...portfolio.projects.flatMap((project) => [project.source, project.demo]),
    ].filter((url): url is string => url !== undefined);

    expect(urls.filter((url) => !HTTPS.test(url))).toEqual([]);
  });

  it("has a contact address that is an address", () => {
    expect(portfolio.contact.email).toMatch(EMAIL);
  });

  it("gives every project somewhere to go", () => {
    for (const project of portfolio.projects) {
      expect(project.source ?? project.demo).toBeDefined();
    }
  });

  it("has something in every section the page renders", () => {
    // Each id in PORTFOLIO_SECTIONS is a heading and a nav link; an empty list
    // behind one would leave a heading over nothing.
    expect(PORTFOLIO_SECTIONS.map((section) => section.id)).toEqual([
      "about",
      "skills",
      "experience",
      "projects",
      "contact",
    ]);
    expect(portfolio.about.body.length).toBeGreaterThan(0);
    expect(portfolio.skills.length).toBeGreaterThan(0);
    expect(portfolio.experience.length).toBeGreaterThan(0);
    expect(portfolio.projects.length).toBeGreaterThan(0);
  });

  it("starts the career on a real month, not in the future", () => {
    expect(portfolio.careerStart).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    expect(Date.parse(`${portfolio.careerStart}-01`)).toBeLessThan(Date.now());
  });

  it("names something being learnt", () => {
    expect(portfolio.about.learning.length).toBeGreaterThan(0);
  });

  it("has no blank strings", () => {
    const blank: string[] = [];

    const walk = (value: unknown, at: string) => {
      if (typeof value === "string") {
        if (value.trim() === "") blank.push(at);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${at}[${index}]`));
      } else if (typeof value === "object" && value !== null) {
        for (const [key, child] of Object.entries(value)) walk(child, `${at}.${key}`);
      }
    };

    walk(portfolio, "portfolio");
    expect(blank).toEqual([]);
  });
});

describe("portfolio stats", () => {
  it("counts whole years, and only once the month has come round", () => {
    expect(yearsSince("2022-07", new Date(2026, 5, 30))).toBe(3);
    expect(yearsSince("2022-07", new Date(2026, 6, 1))).toBe(4);
    expect(yearsSince("2030-01", new Date(2026, 0, 1))).toBe(0);
  });

  it("derives every figure from the data", () => {
    const stats = portfolioStats(portfolio, new Date(2026, 8, 28));

    expect(stats.map((stat) => stat.value)).toEqual([
      "4+",
      `${portfolio.skills.length}`,
      `${portfolio.experience.length}`,
      `${portfolio.projects.length}`,
    ]);
  });
});
