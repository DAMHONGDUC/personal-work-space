/**
 * Generates cv/build/<slug>/ from every CV in the data directory, each merged
 * with the shared parts in src/data/cv/shared/.
 *
 * Run with `npm run cv:tex`. Each folder is a self-contained main.tex plus the
 * image, which is all Overleaf needs — drag one in to preview that version.
 * CI runs the same script and then compiles each folder to its own PDF.
 *
 * Executed by plain Node (TypeScript types are stripped at load), so value
 * imports need their .ts extension and no "@/" alias is available here.
 */
import fs from "node:fs";
import path from "node:path";
import { readCv, readCvShared, readCvSlugs } from "../src/lib/cv/cv-disk.mts";
import { renderCvLatex } from "../src/lib/cv/cv-latex.mts";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

const root = path.join(import.meta.dirname, "..");
const templateDir = path.join(root, ResourceConstant.CV_TEMPLATE_DIR);
const assetsDir = path.join(root, ResourceConstant.CV_ASSETS_DIR);
const buildDir = path.join(root, ResourceConstant.CV_BUILD_DIR);

const template = fs.readFileSync(path.join(templateDir, "main.tex"), "utf8");

const slugs = readCvSlugs(root);
// Read once: every version is merged with the same shared parts.
const shared = readCvShared(root);

if (slugs.length === 0) {
  throw new Error(`No CV JSON found in ${ResourceConstant.CV_DATA_DIR}.`);
}

// Rebuilt from scratch so a renamed asset — or a deleted CV — cannot linger
// from an earlier run.
fs.rmSync(buildDir, { recursive: true, force: true });

for (const slug of slugs) {
  const cv = readCv(root, slug, shared);

  const outDir = path.join(root, ResourceConstant.cvBuildDir(slug));
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "main.tex"), renderCvLatex(cv, template));

  const photo = path.join(assetsDir, cv.header.photo);
  if (!fs.existsSync(photo)) {
    throw new Error(
      `${ResourceConstant.CV_SHARED_DIR}/header.json points at photo "${cv.header.photo}", which is not in ${ResourceConstant.CV_ASSETS_DIR}.`,
    );
  }
  fs.copyFileSync(photo, path.join(outDir, cv.header.photo));

  console.log(`${ResourceConstant.cvBuildDir(slug)}/main.tex written (${cv.label})`);
}
