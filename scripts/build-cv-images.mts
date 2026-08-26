/**
 * Rasterises every published PDF into public/cv/<slug>/page-N.png.
 *
 * The CV page stacks these images in the document flow so the whole CV renders
 * at once and the ordinary page scroll carries it. An <object>/<embed> cannot
 * do that: the browser's PDF plugin always builds its own fixed-height scroll
 * box, and nothing in the page can measure the document to size it.
 *
 * The PDF itself stays the download, so this only affects what is shown inline.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

/** 160dpi on US Letter is 1360x1760 — sharp on a HiDPI screen at ~800px wide. */
const DPI = 160;

const optional = process.argv.includes("--optional");

function has(command: string): boolean {
  try {
    execFileSync("command", ["-v", command], { shell: "/bin/sh", stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const root = path.join(import.meta.dirname, "..");
const publicDir = path.join(root, ResourceConstant.CV_PAGES_DIR);

const slugs = fs.existsSync(publicDir)
  ? fs
      .readdirSync(publicDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => fs.existsSync(path.join(root, ResourceConstant.cvPdfFile(slug))))
      .sort()
  : [];

if (slugs.length === 0) {
  // Without a PDF there is nothing to rasterise. Under --optional the LaTeX
  // step has already explained why, so stay quiet rather than repeat it.
  if (optional) process.exit(0);
  throw new Error(`No published PDF under ${ResourceConstant.CV_PAGES_DIR} — run \`npm run cv:pdf\` first.`);
}

if (!has("pdftoppm")) {
  console.error(
    [
      "pdftoppm not found, so the CV page images were not built.",
      "The CV page falls back to the download link until they are.",
      "",
      "  brew install poppler",
    ].join("\n"),
  );
  process.exit(optional ? 0 : 1);
}

for (const slug of slugs) {
  const outDir = path.join(root, ResourceConstant.cvPublicDir(slug));

  // Only the images are cleared: the PDF published beside them is the download,
  // and it was written by the step before this one.
  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith(".png")) fs.rmSync(path.join(outDir, file));
  }

  execFileSync("pdftoppm", [
    "-png",
    "-r",
    String(DPI),
    path.join(root, ResourceConstant.cvPdfFile(slug)),
    path.join(outDir, "page"),
  ]);

  const pages = fs.readdirSync(outDir).filter((file) => file.endsWith(".png"));

  if (pages.length === 0) {
    throw new Error(`pdftoppm produced no images from ${ResourceConstant.cvPdfFile(slug)}.`);
  }

  console.log(
    `${ResourceConstant.cvPublicDir(slug)}/ written with ${pages.length} page image(s) at ${DPI}dpi`,
  );
}
