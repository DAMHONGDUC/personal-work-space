/**
 * Turns Markdown docs kept in another repo into guide pages on this site.
 *
 * Each series in synced-docs.json is a folder of Markdown files in a local
 * clone of that repo; each file becomes one page, numbered by its position in
 * the folder, so `00-overview.md` is part 0 and names nothing but itself. The
 * pages are English only and keep the Markdown's own section numbers.
 *
 * The Markdown is rendered to HTML here, once, rather than in the browser: the
 * site ships no Markdown parser, and the page draws exactly what this wrote.
 * Along the way:
 *
 * - Headings get GitHub's anchor ids, so the docs' own `#1-product` links and
 *   links from elsewhere keep working.
 * - A link to another synced file points at that page; a link to any other
 *   file in the repo points at it on GitHub; an image is copied into public/.
 *   Links are written relative to the page, so the site's base path is never
 *   needed here.
 * - A `## Contents` section is dropped: the page draws its own.
 *
 * Run by hand — `npm run docs:sync` — and commit the result. The build never
 * reads the other repo.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { Element, ElementContent, Root as HastRoot } from "hast";
import { toText } from "hast-util-to-text";
import type { Heading, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

type Series = {
  id: string;
  name: string;
  github: string;
  branch: string;
  localPath: string;
  dir: string;
  icon: string;
  tags: string[];
};
type Config = { topic: string; series: Series[] };
type Section = { id: string; title: string; blocks: { type: "html"; html: string; text: string }[] };

const root = path.join(import.meta.dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, ResourceConstant.SYNCED_DOCS_CONFIG), "utf8"),
) as Config;
const outDir = path.join(root, ResourceConstant.SYNCED_DOCS_DIR);
const assetsDir = path.join(root, ResourceConstant.SYNCED_DOCS_ASSETS_DIR);
/** The asset folder's URL: public/ is served from the site root. */
const assetsUrl = path.relative(path.join(root, "public"), assetsDir);

const WORDS_PER_MINUTE = 200;
const DROPPED_SECTIONS = new Set(["Contents"]);
const IMAGE_EXTENSIONS = new Set([".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"]);

function log(message: string) {
  console.log(`[docs:sync] ${message}`);
}

function repoRootOf(series: Series): string {
  const repoRoot = path.resolve(root, series.localPath);
  if (!fs.existsSync(path.join(repoRoot, series.dir))) {
    throw new Error(
      `${series.id}: ${path.join(repoRoot, series.dir)} does not exist. Clone ${series.github} there, or fix localPath in ${ResourceConstant.SYNCED_DOCS_CONFIG}.`,
    );
  }
  return repoRoot;
}

function markdownFiles(series: Series): string[] {
  return fs
    .readdirSync(path.join(repoRootOf(series), series.dir))
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function slugOf(series: Series, file: string): string {
  return `${series.id}-${path.basename(file, ".md")}`;
}

/** First and last commit dates of a file, as YYYY-MM-DD; today when it is not committed yet. */
function gitDates(repoRoot: string, file: string): { first: string; last: string } {
  const today = new Date().toISOString().slice(0, 10);
  const run = (...args: string[]) =>
    execFileSync("git", ["-C", repoRoot, "log", ...args, "--format=%cs", "--", file], {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

  const all = run("--follow");
  return { first: all.at(-1) ?? today, last: all[0] ?? today };
}

/**
 * Where a link in the Markdown should point on the site: another synced page,
 * a copied image, or the file on GitHub. Absolute URLs and same-page anchors
 * are left alone.
 */
function rewriteUrl(
  url: string,
  from: string,
  series: Series,
  repoRoot: string,
  pages: Map<string, string>,
): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#")) return url;

  const [target, hash = ""] = url.split("#");
  const absolute = path.resolve(path.dirname(from), decodeURIComponent(target));
  const anchor = hash ? `#${hash}` : "";

  const page = pages.get(absolute);
  if (page) return `../${page}/${anchor}`;

  if (IMAGE_EXTENSIONS.has(path.extname(absolute).toLowerCase()) && fs.existsSync(absolute)) {
    const name = path.basename(absolute);
    fs.mkdirSync(path.join(assetsDir, series.id), { recursive: true });
    fs.copyFileSync(absolute, path.join(assetsDir, series.id, name));
    // The page lives at /docs/<slug>/, two levels below the site root.
    return `../../${assetsUrl}/${series.id}/${name}`;
  }

  const inRepo = path.relative(repoRoot, absolute);
  if (inRepo.startsWith("..")) {
    log(`warning: ${path.basename(from)} links outside the repo: ${url}`);
    return url;
  }
  const kind = fs.existsSync(absolute) && fs.statSync(absolute).isDirectory() ? "tree" : "blob";
  return `https://github.com/${series.github}/${kind}/${series.branch}/${inRepo}${anchor}`;
}

/** Wraps every table so a wide one scrolls on its own instead of widening the page. */
function wrapTables() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      const parentClass = (parent as Element).properties?.className;
      if (Array.isArray(parentClass) && parentClass.includes("md-table")) return;

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["md-table"] },
        children: [node],
      };
      (parent.children as ElementContent[])[index] = wrapper;
    });
  };
}

/** Links leaving the site open in a new tab, so the reader keeps their place. */
function externalLinks() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      const href = node.properties?.href;
      if (node.tagName === "a" && typeof href === "string" && /^https?:/.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noreferrer"];
      }
    });
  };
}

const toHast = unified()
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(wrapTables)
  .use(externalLinks);
const stringify = unified().use(rehypeStringify);

function render(nodes: RootContent[]): { html: string; text: string } {
  const hast = toHast.runSync({ type: "root", children: nodes } satisfies Root) as HastRoot;
  return {
    html: stringify.stringify(hast).trim(),
    text: toText(hast).replace(/\s+/g, " ").trim(),
  };
}

function convert(series: Series, file: string, part: number, pages: Map<string, string>) {
  const repoRoot = repoRootOf(series);
  const absolute = path.join(repoRoot, series.dir, file);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(fs.readFileSync(absolute, "utf8")) as Root;

  // GitHub's ids, assigned in document order so duplicates get the same -1, -2.
  const slugger = new GithubSlugger();
  visit(tree, "heading", (node: Heading) => {
    node.data = { ...node.data, hProperties: { id: slugger.slug(toString(node)) } };
  });
  visit(tree, (node) => node.type === "link" || node.type === "image" || node.type === "definition", (node) => {
    const linked = node as { url: string };
    linked.url = rewriteUrl(linked.url, absolute, series, repoRoot, pages);
  });

  const h1 = tree.children.find((node): node is Heading => node.type === "heading" && node.depth === 1);
  const title = h1 ? toString(h1) : path.basename(file, ".md");

  const intro: RootContent[] = [];
  const chunks: { heading: Heading; nodes: RootContent[] }[] = [];
  for (const node of tree.children) {
    if (node === h1) continue;
    if (node.type === "heading" && node.depth === 2) {
      chunks.push({ heading: node, nodes: [] });
    } else if (chunks.length === 0) {
      intro.push(node);
    } else {
      chunks.at(-1)!.nodes.push(node);
    }
  }

  const sections: Section[] = chunks
    .filter(({ heading }) => !DROPPED_SECTIONS.has(toString(heading)))
    .map(({ heading, nodes }) => ({
      id: (heading.data as { hProperties: { id: string } }).hProperties.id,
      title: toString(heading),
      blocks: [{ type: "html" as const, ...render(nodes) }],
    }))
    .filter((section) => section.blocks[0].html !== "");

  // The lines under the title read as the intro: list items, else paragraphs.
  const introRoot: Root = { type: "root", children: intro };
  const introLines: string[] = [];
  visit(introRoot, "listItem", (node) => {
    introLines.push(toString(node).replace(/\s+/g, " ").trim());
  });
  if (introLines.length === 0) {
    visit(introRoot, "paragraph", (node) => {
      introLines.push(toString(node).replace(/\s+/g, " ").trim());
    });
  }

  // A guide's overview names its goal; that makes the best one-line tagline.
  let goal: string | undefined;
  visit(tree, "listItem", (node) => {
    const line = toString(node).replace(/\s+/g, " ").trim();
    if (!goal && line.startsWith("Goal:")) goal = line.slice("Goal:".length).trim();
  });

  const words = sections.reduce((sum, section) => sum + section.blocks[0].text.split(" ").length, 0);
  const rel = path.join(series.dir, file);

  return {
    dates: gitDates(repoRoot, rel),
    doc: {
      title,
      tagline: goal ?? introLines[0] ?? series.name,
      icon: series.icon,
      topic: config.topic,
      tags: series.tags,
      readingTime: `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min`,
      languages: ["en"],
      numbered: false,
      series: { id: series.id, part, name: series.name },
      intro: introLines.length > 0 ? introLines : [series.name],
      sections,
    },
  };
}

function sync() {
  // Every synced file's page slug, known up front so links between them resolve.
  const pages = new Map<string, string>();
  for (const series of config.series) {
    for (const file of markdownFiles(series)) {
      pages.set(path.join(repoRootOf(series), series.dir, file), slugOf(series, file));
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const series of config.series) {
    for (const stale of fs.readdirSync(outDir).filter((file) => file.startsWith(`${series.id}-`))) {
      fs.rmSync(path.join(outDir, stale));
    }
    fs.rmSync(path.join(assetsDir, series.id), { recursive: true, force: true });

    const converted = markdownFiles(series).map((file, part) => ({
      file,
      ...convert(series, file, part, pages),
    }));

    // One date for the whole series, so its pages stay together and in order
    // in the index, which sorts by date and then by slug.
    const updated = converted.map(({ dates }) => dates.last).sort().at(-1)!;

    for (const { file, dates, doc } of converted) {
      const out = path.join(outDir, `${slugOf(series, file)}.json`);
      const data = { ...doc, effectiveDate: dates.first, lastUpdated: updated };
      fs.writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
      log(`${series.id}: ${file} → ${path.relative(root, out)} (${doc.sections.length} sections)`);
    }
  }
}

sync();
