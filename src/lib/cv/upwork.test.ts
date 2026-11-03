import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import source from "@/data/cv/upwork/upwork.json";
import { cv } from "@/lib/cv/cv";
import { buildUpwork, upwork, type UpworkSource } from "@/lib/cv/upwork";
import { projectMedia } from "@/lib/projects/project-media";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const field = (label: string) => upwork.profile.find((item) => item.label === label)!.text;

describe("the Upwork profile", () => {
  it("is the file ResourceConstant names", () => {
    const onDisk = JSON.parse(fs.readFileSync(path.join(process.cwd(), ResourceConstant.CV_UPWORK_FILE), "utf8"));

    expect(onDisk).toEqual(source);
  });

  it("opens its overview with the CV's About me, years counted", () => {
    const overview = field("Overview");

    expect(overview.startsWith(cv.aboutMe.map((line) => `- ${line}`).join("\n"))).toBe(true);
    expect(overview).not.toContain("{{");
  });

  it("links a portfolio project to its CV project's GitHub", () => {
    for (const project of (source as UpworkSource).portfolio) {
      const url = upwork.portfolio
        .find((group) => group.title === project.title)!
        .fields.find((item) => item.label === "Project URL")?.text;
      const cvProject = cv.projects.find((item) => item.name === project.cvProject);

      expect(url).toBe(cvProject?.links[0].href);
    }
  });

  it("offers each portfolio project's shared cover and video", () => {
    const baroEase = upwork.portfolio.find((group) => group.title === "BaroEase: Migraine Tracker")!;

    expect(baroEase.media).toBe(projectMedia.BaroEase);
    expect(baroEase.fields.find((item) => item.label === "Video")!.text).toBe(projectMedia.BaroEase.youtube);
  });

  it("refuses a portfolio project the CV does not have", () => {
    const broken = { ...source, portfolio: [{ ...source.portfolio[0], cvProject: "Nope" }] } as UpworkSource;

    expect(() => buildUpwork(broken, cv)).toThrow('"Nope"');
  });

  it("takes its education from the CV, years only", () => {
    expect(upwork.education.map((group) => group.title)).toEqual(cv.education.map((school) => school.institution));
    // Sep 2019 – Aug 2023 on the CV.
    expect(upwork.education[0].fields.find((item) => item.label === "Dates attended")!.text).toBe("2019 – 2023");
  });
});
