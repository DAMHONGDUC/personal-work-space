/**
 * Reads a CV from disk the way the site's static imports read it: the version
 * file merged with the shared parts.
 *
 * For the plain-Node LaTeX build and the tests, which cannot use the bundler's
 * JSON imports. Value imports name their .mts file, as bare Node requires.
 */
import fs from "node:fs";
import path from "node:path";
import { mergeCv } from "./cv-merge.mts";
import { ResourceConstant } from "../resource-constant.mts";
import type { Cv, CvShared, CvSource } from "./cv-types";

function readJson<T>(root: string, file: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as T;
}

/** The shared parts every version is merged with. */
export function readCvShared(root: string): CvShared {
  const dir = ResourceConstant.CV_SHARED_DIR;

  return {
    header: readJson(root, `${dir}/header.json`),
    aboutMe: readJson(root, `${dir}/about-me.json`),
    education: readJson(root, `${dir}/education.json`),
    skills: readJson(root, `${dir}/skills.json`),
    projects: readJson(root, `${dir}/projects.json`),
    experience: readJson(root, `${dir}/experience.json`),
  };
}

/** The version files in the data directory, by slug, sorted. */
export function readCvSlugs(root: string): string[] {
  return fs
    .readdirSync(path.join(root, ResourceConstant.CV_DATA_DIR))
    .filter((file) => file.endsWith(".json"))
    .map((file) => ResourceConstant.cvSlug(file))
    .sort();
}

/** One complete CV from any file in the version format, ready to render. */
export function readCvFile(root: string, file: string, shared = readCvShared(root)): Cv {
  return mergeCv(readJson<CvSource>(root, file), shared);
}

/** One complete CV version, by slug. */
export function readCv(root: string, slug: string, shared = readCvShared(root)): Cv {
  return readCvFile(root, `${ResourceConstant.CV_DATA_DIR}/${slug}.json`, shared);
}
