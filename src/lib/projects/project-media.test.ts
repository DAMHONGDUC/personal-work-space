import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import source from "@/data/project-media.json";
import upworkSource from "@/data/cv/upwork/upwork.json";
import { cv } from "@/lib/cv/cv";
import { projectMedia } from "@/lib/projects/project-media";
import { ResourceConstant } from "@/lib/resource-constant.mts";

describe("project media", () => {
  it("is the file ResourceConstant names", () => {
    const onDisk = JSON.parse(fs.readFileSync(path.join(process.cwd(), ResourceConstant.PROJECT_MEDIA_FILE), "utf8"));

    expect(onDisk).toEqual(source);
  });

  it("names only projects the CV or the Upwork portfolio has", () => {
    const names = [...cv.projects.map((project) => project.name), ...upworkSource.portfolio.map((project) => project.title)];

    expect(Object.keys(projectMedia).filter((name) => !names.includes(name))).toEqual([]);
  });

  it("gives every Upwork portfolio project a cover and a video", () => {
    const missing = upworkSource.portfolio
      .map((project) => ("cvProject" in project ? project.cvProject : project.title) as string)
      .filter((name) => !projectMedia[name]);

    expect(missing).toEqual([]);
  });

  it("points at covers that ship and at YouTube videos", () => {
    const bad = Object.entries(projectMedia)
      .filter(
        ([, media]) =>
          !media.cover.startsWith("/") ||
          !fs.existsSync(path.join(process.cwd(), ResourceConstant.PUBLIC_DIR, media.cover)) ||
          !/^https:\/\/youtu\.be\/[\w-]{11}$/.test(media.youtube),
      )
      .map(([name]) => name);

    expect(bad).toEqual([]);
  });
});
