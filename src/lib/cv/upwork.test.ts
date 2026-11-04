import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import source from "@/data/cv/upwork/upwork.json";
import { cv, SHARED } from "@/lib/cv/cv";
import { buildUpwork, UPWORK_LIMITS, upwork, type UpworkSource } from "@/lib/cv/upwork";
import { projectDetails } from "@/lib/projects/project-details";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const field = (label: string) => upwork.profile.find((item) => item.label === label)!.text;

describe("the Upwork profile", () => {
  it("is the file ResourceConstant names", () => {
    const onDisk = JSON.parse(fs.readFileSync(path.join(process.cwd(), ResourceConstant.CV_UPWORK_FILE), "utf8"));

    expect(onDisk).toEqual(source);
  });

  it("pitches a senior with 5+ years, one point per line", () => {
    const overview = field("Overview");

    expect(overview).toContain("senior mobile developer with 5+ years");
    expect(overview).not.toContain("{{");
    expect(overview.split("\n").every((line) => line.startsWith("- "))).toBe(true);
  });

  it("links a portfolio project to its CV project's GitHub", () => {
    for (const project of (source as UpworkSource).portfolio) {
      const url = upwork.portfolio
        .find((group) => group.title === project.title)!
        .fields.find((item) => item.label === "Project URL")?.text;
      const cvProject = SHARED.projects.find((item) => item.name === project.cvProject);

      expect(url).toBe(cvProject?.links[0].href);
    }
  });

  it("describes each portfolio project with its shared points and video", () => {
    const baroEase = upwork.portfolio.find((group) => group.title === "BaroEase: Migraine Tracker")!;
    const text = (label: string) => baroEase.fields.find((item) => item.label === label)!.text;

    expect(baroEase.details).toBe(projectDetails.BaroEase);
    expect(text("Video")).toBe(projectDetails.BaroEase.youtube);
    expect(text("Description").split("\n")).toEqual([
      ...projectDetails.BaroEase.highlights.map((line) => `- ${line}`),
      `- Demo: ${projectDetails.BaroEase.youtube}`,
      "- TestFlight build ready — ping me to try it",
    ]);
  });

  it("fits Upwork's limits on a project's title and description", () => {
    const over = upwork.portfolio.flatMap((group) =>
      group.fields
        .filter((item) => (item.label === "Title" && item.text.length > UPWORK_LIMITS.title) || (item.label === "Description" && item.text.length > UPWORK_LIMITS.description))
        .map((item) => `${group.title}: ${item.label}`),
    );

    expect(over).toEqual([]);
  });

  it("refuses a portfolio project the CV does not have", () => {
    const broken = { ...source, portfolio: [{ ...source.portfolio[0], cvProject: "Nope" }] } as UpworkSource;

    // Details for "Nope", so it is the missing CV project that throws.
    expect(() => buildUpwork(broken, cv, { ...projectDetails, Nope: projectDetails.BaroEase })).toThrow(
      "which is not a CV project",
    );
  });

  it("refuses a portfolio project with no project details", () => {
    const broken = { ...source, portfolio: [{ ...source.portfolio[0], title: "Untold" }] } as UpworkSource;

    expect(() => buildUpwork(broken, cv)).toThrow('"Untold" has no project details');
  });

  it("has its video introduction and thumbnail rendered, from a film source that writes them", () => {
    const render = fs.readFileSync(path.join(process.cwd(), ResourceConstant.UPWORK_INTRO_SOURCE_DIR, "render.sh"), "utf8");

    for (const file of [ResourceConstant.UPWORK_INTRO_VIDEO, ResourceConstant.UPWORK_INTRO_THUMBNAIL]) {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
      expect(render).toContain(`$ROOT/${file}`);
    }
  });

  it("takes its education from the CV, years only", () => {
    expect(upwork.education.map((group) => group.title)).toEqual(cv.education.map((school) => school.institution));
    // Sep 2019 – Aug 2023 on the CV.
    expect(upwork.education[0].fields.find((item) => item.label === "Dates attended")!.text).toBe("2019 – 2023");
  });
});
