/**
 * Compiles every cv/build/<slug>/main.tex, so `/personal/cv/` shows the real
 * documents during local development.
 *
 * Needs a LaTeX installation. CI does the same compile in a container, so this
 * is a convenience rather than the source of the deployed PDFs — skipping it
 * only means the CV page keeps saying the PDF has not been built.
 *
 * Publishing the results into public/ is `publish-cv-pdf.mts`, because CI
 * compiles with its own action and then runs that step alone.
 *
 * With --optional, a missing LaTeX is a note rather than a failure, so the step
 * can sit in front of `next dev` without blocking it. A LaTeX that is present
 * but fails to compile is still an error either way.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

const optional = process.argv.includes("--optional");

const root = path.join(import.meta.dirname, "..");
const buildDir = path.join(root, ResourceConstant.CV_BUILD_DIR);

function has(command: string): boolean {
  try {
    execFileSync("command", ["-v", command], { shell: "/bin/sh", stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!fs.existsSync(buildDir)) {
  throw new Error(`${ResourceConstant.CV_BUILD_DIR} is missing — run \`npm run cv:tex\` first.`);
}

const slugs = fs
  .readdirSync(buildDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => fs.existsSync(path.join(buildDir, slug, "main.tex")))
  .sort();

if (slugs.length === 0) {
  throw new Error(`No main.tex under ${ResourceConstant.CV_BUILD_DIR} — run \`npm run cv:tex\` first.`);
}

// Ordered by fidelity to what CI ships. CI compiles with pdflatex, which is
// also what Overleaf defaults to, so those two reproduce the deployed PDF
// exactly. Tectonic is the fallback because it installs without sudo and
// fetches packages on demand — same layout, but it is XeTeX, so it falls back
// to Latin Modern where the others use Charter.
const engine = ["latexmk", "pdflatex", "tectonic"].find(has);

if (!engine) {
  console.error(
    [
      "No LaTeX installation found, so the CV PDFs were not built.",
      "",
      "Three ways to see the CV:",
      "  1. Overleaf  — drag a cv/build/<version>/ folder into a new project",
      "  2. CI        — open a PR and download the `cv-pdf` artifact",
      "  3. Locally   — brew install tectonic (no sudo), then re-run this",
      "",
      "The site works either way; /personal/cv/ just says the PDF is not built.",
    ].join("\n"),
  );
  process.exit(optional ? 0 : 1);
}

const ARGS: Record<string, string[]> = {
  latexmk: ["-pdf", "-interaction=nonstopmode", "-halt-on-error", "main.tex"],
  pdflatex: ["-interaction=nonstopmode", "-halt-on-error", "main.tex"],
  tectonic: ["--chatter", "minimal", "main.tex"],
};

// Bare pdflatex needs a second pass to settle references; the other two rerun
// themselves as needed.
const passes = engine === "pdflatex" ? 2 : 1;

for (const slug of slugs) {
  const cwd = path.join(root, ResourceConstant.cvBuildDir(slug));

  for (let pass = 0; pass < passes; pass += 1) {
    execFileSync(engine, ARGS[engine], { cwd, stdio: "inherit" });
  }

  console.log(`${ResourceConstant.cvBuildDir(slug)}/main.pdf compiled with ${engine}`);
}
