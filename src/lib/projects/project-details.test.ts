import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import source from "@/data/project-details.json";
import upworkSource from "@/data/cv/upwork/upwork.json";
import { SHARED } from "@/lib/cv/cv";
import { HIGHLIGHT_MAX, projectDetails } from "@/lib/projects/project-details";
import { ResourceConstant } from "@/lib/resource-constant.mts";

describe("project details", () => {
  it("is the file ResourceConstant names", () => {
    const onDisk = JSON.parse(fs.readFileSync(path.join(process.cwd(), ResourceConstant.PROJECT_DETAILS_FILE), "utf8"));

    expect(onDisk).toEqual(source);
  });

  it("names only projects the CV or the Upwork portfolio has", () => {
    const names = [...SHARED.projects.map((project) => project.name), ...upworkSource.portfolio.map((project) => project.title)];

    expect(Object.keys(projectDetails).filter((name) => !names.includes(name))).toEqual([]);
  });

  it("gives every Upwork portfolio project a cover and a video", () => {
    const missing = upworkSource.portfolio
      .map((project) => ("cvProject" in project ? project.cvProject : project.title) as string)
      .filter((name) => !projectDetails[name]);

    expect(missing).toEqual([]);
  });

  it("points at covers that ship and at YouTube videos", () => {
    const bad = Object.entries(projectDetails)
      .filter(
        ([, media]) =>
          !media.cover.startsWith("/") ||
          !fs.existsSync(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, media.cover)) ||
          !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}(&list=[\w-]+(&index=\d+)?)?$/.test(media.youtube),
      )
      .map(([name]) => name);

    expect(bad).toEqual([]);
  });

  it("keeps every project to a few short points", () => {
    const bad = Object.entries(projectDetails)
      .filter(([, details]) => details.highlights.length < 4 || details.highlights.length > 6 || details.highlights.some((line) => line.length > HIGHLIGHT_MAX))
      .map(([name]) => name);

    expect(bad).toEqual([]);
  });
});
