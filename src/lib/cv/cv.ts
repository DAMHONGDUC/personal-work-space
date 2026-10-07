import fs from "node:fs";
import path from "node:path";
import normal from "@/data/cv/cv_normal.json";
import withFreelancer from "@/data/cv/cv_with_freelancer.json";
import education from "@/data/cv/shared/education.json";
import experience from "@/data/cv/shared/experience.json";
import header from "@/data/cv/shared/header.json";
import projects from "@/data/cv/shared/projects.json";
import { mergeCv } from "@/lib/cv/cv-merge.mts";
import type { Cv, CvPage, CvPdf, CvShared, CvSource, CvVersion } from "@/lib/cv/cv-types";
import { ResourceConstant } from "@/lib/resource-constant.mts";

export type { Cv, CvPage, CvPdf, CvVersion } from "@/lib/cv/cv-types";

/** What every version has in common, merged into each one below. */
const SHARED = { header, education, projects, experience } as CvShared;

/**
 * Every CV, keyed by the slug its filename gives it, each merged with the
 * shared parts — the same merge the LaTeX build runs, in cv-merge.mts.
 *
 * This is the one content directory in the project that does not read itself.
 * Bundling a static export needs a literal import path, so each file has to be
 * named here — `tests/cv-data.test.ts` compares this map against the directory
 * so a new CV cannot be added and then silently left out of the switcher.
 */
const VERSIONS: Record<string, Cv> = {
  cv_normal: mergeCv(normal as CvSource, SHARED),
  cv_with_freelancer: mergeCv(withFreelancer as CvSource, SHARED),
};

/**
 * The CV shown first, and the one the page's metadata is written from. Edit
 * the file named by CV_DATA_FILE — never the generated LaTeX.
 */
export const cv = VERSIONS[ResourceConstant.DEFAULT_CV_SLUG];

/**
 * Every CV, default first and the rest in slug order, with its built PDF and
 * page images attached.
 *
 * Read at build time: every route is prerendered and the export has no server,
 * so artefacts produced later are picked up by the next build.
 */
export function getCvVersions(): CvVersion[] {
  return Object.keys(VERSIONS)
    .sort((a, b) => {
      // The default leads, whatever it is called; the rest sort by name so the
      // order does not depend on the order the imports happen to be written in.
      if (a === ResourceConstant.DEFAULT_CV_SLUG) return -1;
      if (b === ResourceConstant.DEFAULT_CV_SLUG) return 1;
      return a.localeCompare(b);
    })
    .map((slug) => ({
      slug,
      label: VERSIONS[slug].label,
      data: VERSIONS[slug],
      pdf: getCvPdf(slug),
      pages: getCvPages(slug),
    }));
}

/**
 * `CV_DAM_HONG_DUC_25_08_2026.pdf` — the name the download is saved under.
 *
 * The file stays `cv.pdf` on the server: one stable URL per version, which is
 * what the app stores and any existing link points at. The readable name is
 * the anchor's `download` attribute instead, so only the copy on the visitor's
 * disk carries it.
 *
 * The same name for every version, deliberately: this is what the CV has
 * always been sent as, and the version is the sender's business rather than
 * something a recruiter should have to read off a filename.
 *
 * The date is the day the site was built. Every route is prerendered and the
 * export has no server, so this is fixed when `next build` runs — a CV rebuilt
 * and deployed today is downloaded with today's date on it.
 */
export function cvPdfFileName(builtAt = new Date(), from = cv.header.name): string {
  const name = from
    // Decompose, then drop the combining marks: đ and the Vietnamese tones do
    // not survive a filename intact on every platform.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    // Anything that is not a letter or a digit becomes the one separator, so
    // spaces, punctuation and a double space all read the same way.
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  // The builder's own calendar day, and day-first because that is how the date
  // is read where this CV is sent.
  const day = String(builtAt.getDate()).padStart(2, "0");
  const month = String(builtAt.getMonth() + 1).padStart(2, "0");

  return `CV_${name}_${day}_${month}_${builtAt.getFullYear()}.pdf`;
}

/**
 * One CV's compiled PDF, or null when it has not been built yet.
 */
export function getCvPdf(slug = ResourceConstant.DEFAULT_CV_SLUG): CvPdf | null {
  const published = ResourceConstant.cvPdfFile(slug);
  const file = path.join(process.cwd(), published);

  if (!fs.existsSync(file)) {
    return null;
  }

  return {
    // Anything under public/ is served from the site root, so the URL is the
    // path with that prefix taken off — derived rather than written out twice.
    url: `/${path.relative(ResourceConstant.PUBLIC_DIR, published)}`,
    fileName: cvPdfFileName(new Date(), VERSIONS[slug]?.header.name),
    sizeKb: Math.max(1, Math.round(fs.statSync(file).size / 1024)),
  };
}

const PAGE_FILE = /^page-(\d+)\.png$/;

/**
 * A PNG's pixel dimensions, read from the IHDR chunk that always starts at
 * byte 16. The <img> needs them to reserve the right space before the image
 * loads, and reading the header beats adding an image library for two numbers.
 */
function pngSize(file: string): { width: number; height: number } {
  const header = Buffer.alloc(24);
  const handle = fs.openSync(file, "r");

  try {
    fs.readSync(handle, header, 0, 24, 0);
  } finally {
    fs.closeSync(handle);
  }

  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

/**
 * Every page of one CV in order, or an empty list when the images have not
 * been built. Read at build time, like the rest of the content.
 */
export function getCvPages(slug = ResourceConstant.DEFAULT_CV_SLUG): CvPage[] {
  const published = ResourceConstant.cvPublicDir(slug);
  const dir = path.join(process.cwd(), published);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const url = `/${path.relative(ResourceConstant.PUBLIC_DIR, published)}`;

  return fs
    .readdirSync(dir)
    .map((file) => ({ file, match: PAGE_FILE.exec(file) }))
    .filter((entry): entry is { file: string; match: RegExpExecArray } =>
      Boolean(entry.match),
    )
    // Numeric, not lexicographic: page-10 must not sort between page-1 and 2.
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]))
    .map(({ file }) => ({
      url: `${url}/${file}`,
      ...pngSize(path.join(dir, file)),
    }));
}
