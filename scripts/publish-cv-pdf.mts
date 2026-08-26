/**
 * Copies every compiled cv/build/<slug>/main.pdf into public/<slug>/cv.pdf.
 *
 * A separate step from the compile because CI typesets with its own LaTeX
 * action rather than with build-cv-pdf.mts, and then still has to put the
 * results where the site build will find them.
 *
 * The default CV is also copied to public/cv.pdf. That is the address the app
 * store listings and any existing link already point at, so it keeps
 * resolving whatever the switcher does.
 *
 * With --optional, nothing to publish is a silent no-op: the compile step has
 * already explained why LaTeX was skipped.
 */
import fs from "node:fs";
import path from "node:path";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

const optional = process.argv.includes("--optional");

const root = path.join(import.meta.dirname, "..");
const buildDir = path.join(root, ResourceConstant.CV_BUILD_DIR);
const publicDir = path.join(root, ResourceConstant.CV_PAGES_DIR);

const slugs = fs.existsSync(buildDir)
  ? fs
      .readdirSync(buildDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => fs.existsSync(path.join(buildDir, slug, "main.pdf")))
      .sort()
  : [];

if (slugs.length === 0) {
  if (optional) process.exit(0);
  throw new Error(`No compiled PDF under ${ResourceConstant.CV_BUILD_DIR} — run \`npm run cv:pdf\` first.`);
}

// Rebuilt from scratch so a CV that has been renamed or deleted cannot linger
// in the switcher. The page images are written into these same folders
// afterwards, which is why that script does not clear this directory itself.
fs.rmSync(publicDir, { recursive: true, force: true });

for (const slug of slugs) {
  const published = path.join(root, ResourceConstant.cvPdfFile(slug));

  fs.mkdirSync(path.dirname(published), { recursive: true });
  fs.copyFileSync(path.join(buildDir, slug, "main.pdf"), published);

  if (slug === ResourceConstant.DEFAULT_CV_SLUG) {
    fs.copyFileSync(published, path.join(root, ResourceConstant.CV_PDF_FILE));
  }

  console.log(`${ResourceConstant.cvPdfFile(slug)} written`);
}
