/**
 * Turns Markdown docs kept in another repo into guide pages on this site.
 *
 * Each series in synced-docs.json is one root file followed by folders of
 * Markdown in a local clone of that repo. The root file is part 0 — the page
 * the guide index lists — and every other file is one page after it, in the
 * order the config names the folders and the folder sorts its files. A folder
 * can carry a group name, which the series navigation shows as a heading.
 * Pages are English only and keep the Markdown's own section numbers.
 *
 * The Markdown is rendered to HTML here, once, rather than in the browser: the
 * site ships no Markdown parser, and the page draws exactly what this wrote.
 * Along the way:
 *
 * - Headings get GitHub's anchor ids, so the docs' own `#1-product` links and
 *   links from elsewhere keep working.
 * - A link to another synced file, or to a synced folder, points at that page;
 *   a link to any other file in the repo points at it on GitHub; an image is
 *   copied into public/. Links are written relative to the page, so the site's
 *   base path is never needed here.
 * - A ```mermaid block is drawn to SVG with mermaid-cli, once light and once
 *   dark, and shown as a <picture> that follows the reader's colour scheme.
 *   Drawings are named by a hash of their source and kept between syncs, so an
 *   unchanged diagram is not drawn again.
 * - Code is coloured with Shiki, as the site's own code blocks are, and given
 *   a bar naming the language with a copy button (wired up by HtmlBlock).
 * - The file path on a task's "File ·" line is marked to show as a tag, and a
 *   task's parts become lettered steps: a. File, b. Explain, c. Think, d. Code,
 *   e. Try.
 * - Every <details> but a task's Code becomes a framed block that is always
 *   shown; the Code fold stays, closed.
 * - A `## Contents` section is dropped: the page draws its own.
 *
 * Run by hand — `make site-log-docs-sync` — and commit the result. The build
 * never reads the other repo.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import rehypeShiki from "@shikijs/rehype";
import GithubSlugger from "github-slugger";
import type { Element, ElementContent, Root as HastRoot } from "hast";
import { toText } from "hast-util-to-text";
import type { Code, Heading, Html, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { CodeHighlight } from "../src/lib/docs/code-highlight.mts";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

/** One entry of a series: a single file, or a folder of them. */
type Part = {
  file?: string;
  slug?: string;
  title?: string;
  dir?: string;
  slugPrefix?: string;
  group?: string;
  icon: string;
  tags?: string[];
};
type Series = {
  id: string;
  name: string;
  topic: string;
  github: string;
  branch: string;
  localPath: string;
  tags: string[];
  parts: Part[];
};
type Config = { series: Series[] };
/** One Markdown file and the page it becomes. */
type Page = { absolute: string; slug: string; part: Part };
type Section = { id: string; title: string; blocks: { type: "html"; html: string; text: string }[] };

const root = path.join(import.meta.dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(root, ResourceConstant.SYNCED_DOCS_CONFIG), "utf8"),
) as Config;
const outDir = path.join(root, ResourceConstant.SYNCED_DOCS_DIR);
const assetsDir = path.join(root, ResourceConstant.SYNCED_DOCS_ASSETS_DIR);
/** The asset folder's URL: public/ is served from the site root. */
const assetsUrl = path.relative(path.join(root, "public"), assetsDir);
const mmdc = path.join(root, "node_modules", ".bin", "mmdc");

const WORDS_PER_MINUTE = 200;
const DROPPED_SECTIONS = new Set(["Contents"]);
const IMAGE_EXTENSIONS = new Set([".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"]);
/** Plain SVG text instead of HTML labels: an SVG shown through <img> may not draw HTML. */
const MERMAID_CONFIG = { flowchart: { htmlLabels: false } };

/** Every asset this sync wrote or kept; anything else in the asset folder is stale. */
const usedAssets = new Set<string>();

function log(message: string) {
  console.log(`[docs:sync] ${message}`);
}

function repoRootOf(series: Series): string {
  const repoRoot = path.resolve(root, series.localPath);
  if (!fs.existsSync(repoRoot)) {
    throw new Error(
      `${series.id}: ${repoRoot} does not exist. Clone ${series.github} there, or fix localPath in ${ResourceConstant.SYNCED_DOCS_CONFIG}.`,
    );
  }
  return repoRoot;
}

/** The series' pages in reading order: the root file first, then each folder's files. */
function pagesOf(series: Series): Page[] {
  const repoRoot = repoRootOf(series);

  const pages = series.parts.flatMap((part): Page[] => {
    if (part.file) {
      return [{ absolute: path.join(repoRoot, part.file), slug: part.slug!, part }];
    }
    return fs
      .readdirSync(path.join(repoRoot, part.dir!))
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => ({
        absolute: path.join(repoRoot, part.dir!, file),
        slug: `${part.slugPrefix}-${path.basename(file, ".md")}`,
        part,
      }));
  });

  // Stale pages are found by this prefix, so every slug has to carry it.
  for (const page of pages) {
    if (!page.slug.startsWith(`${series.id}-`)) {
      throw new Error(`${page.slug} must start with "${series.id}-"`);
    }
  }
  return pages;
}

/** First and last commit dates of a file, as YYYY-MM-DD; today when it is not committed yet. */
function gitDates(repoRoot: string, file: string): { first: string; last: string } {
  const today = new Date().toISOString().slice(0, 10);
  const dates = execFileSync(
    "git",
    ["-C", repoRoot, "log", "--follow", "--format=%cs", "--", file],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  return { first: dates.at(-1) ?? today, last: dates[0] ?? today };
}

function escapeAttribute(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

/** An SVG's drawn size, from its viewBox. */
function svgSize(svg: string): { width: number; height: number } | null {
  const box = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/);
  return box ? { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) } : null;
}

/**
 * A mermaid-cli SVG says width="100%", which an <img> cannot size from; give
 * it the drawing's own size so it shows at that size and shrinks to fit.
 */
function fixSvgSize(file: string) {
  const svg = fs.readFileSync(file, "utf8");
  const box = svgSize(svg);
  if (!box) return;

  fs.writeFileSync(
    file,
    svg
      .replace('width="100%"', `width="${box.width}" height="${box.height}"`)
      .replace(/max-width:\s*[\d.]+px;?\s*/, ""),
  );
}

/**
 * Draws a mermaid block twice, for light and dark, and returns the HTML that
 * shows it — or null when mermaid cannot parse it, so the page keeps the block
 * as code and the sync names the file to fix instead of stopping.
 */
function renderMermaid(source: string, series: Series, from: string): string | null {
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 12);
  const dir = path.join(assetsDir, series.id);
  fs.mkdirSync(dir, { recursive: true });

  const files = { light: `diagram-${hash}-light.svg`, dark: `diagram-${hash}-dark.svg` };
  const themes = { light: "default", dark: "dark" } as const;

  for (const scheme of ["light", "dark"] as const) {
    const out = path.join(dir, files[scheme]);
    usedAssets.add(out);
    if (fs.existsSync(out)) continue;

    const work = fs.mkdtempSync(path.join(os.tmpdir(), "sync-docs-"));
    const input = path.join(work, "diagram.mmd");
    const settings = path.join(work, "config.json");
    fs.writeFileSync(input, source);
    fs.writeFileSync(settings, JSON.stringify(MERMAID_CONFIG));
    try {
      execFileSync(
        mmdc,
        ["-i", input, "-o", out, "-t", themes[scheme], "-b", "transparent", "-c", settings, "--quiet"],
        { stdio: ["ignore", "ignore", "pipe"] },
      );
    } catch (error) {
      const reason = String((error as { stderr?: Buffer }).stderr ?? error).match(/Parse error[^\n]*/)?.[0];
      log(`warning: ${path.basename(from)}: a mermaid diagram does not parse (${reason ?? "see mmdc"}); kept as code`);
      usedAssets.delete(out);
      return null;
    } finally {
      fs.rmSync(work, { recursive: true, force: true });
    }
    fixSvgSize(out);
    log(`${series.id}: drew diagram ${hash} (${scheme})`);
  }

  // The quoted labels, in order, describe the drawing well enough to read aloud.
  const labels = [...source.matchAll(/"([^"]+)"/g)].map(([, label]) => label.replace(/<br\s*\/?>/g, ", "));
  const alt = labels.length > 0 ? `Diagram: ${labels.join(" → ")}` : "Diagram";
  const url = (file: string) => `../../${assetsUrl}/${series.id}/${file}`;
  // The size on the <img> holds the drawing's space before it loads, so the
  // page does not grow under a reader scrolling past — or to a section below.
  const size = svgSize(fs.readFileSync(path.join(dir, files.light), "utf8"));
  const dimensions = size ? ` width="${size.width}" height="${size.height}"` : "";

  return [
    '<figure class="md-diagram"><picture>',
    `<source media="(prefers-color-scheme: dark)" srcset="${url(files.dark)}">`,
    `<img src="${url(files.light)}" alt="${escapeAttribute(alt)}"${dimensions} loading="lazy">`,
    "</picture></figure>",
  ].join("");
}

/**
 * Where a link in the Markdown should point on the site: another synced page,
 * the first page of a synced folder, a copied image, or the file on GitHub.
 * Absolute URLs and same-page anchors are left alone.
 */
function rewriteUrl(
  url: string,
  from: string,
  series: Series,
  repoRoot: string,
  pages: Map<string, string>,
  folders: Map<string, string>,
): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#")) return url;

  const [target, hash = ""] = url.split("#");
  const absolute = path.resolve(path.dirname(from), decodeURIComponent(target));
  const anchor = hash ? `#${hash}` : "";

  const page = pages.get(absolute) ?? folders.get(absolute);
  if (page) return `../${page}/${anchor}`;

  if (IMAGE_EXTENSIONS.has(path.extname(absolute).toLowerCase()) && fs.existsSync(absolute)) {
    const name = path.basename(absolute);
    const copy = path.join(assetsDir, series.id, name);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(absolute, copy);
    usedAssets.add(copy);
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

/** Lucide's copy icon, inline so the button needs no script to draw. */
const COPY_ICON =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

/**
 * Puts each code block in a frame with a bar over it: the language, and a copy
 * button HtmlBlock listens for. Plain-text blocks show no language name.
 */
function frameCode() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const parentClass = (parent as Element).properties?.className;
      if (Array.isArray(parentClass) && parentClass.includes("md-code")) return;

      const code = node.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
      // Shiki writes the class as a string under `class`; hast's own is a `className` array.
      const classes = code?.properties?.className ?? code?.properties?.class;
      const names = Array.isArray(classes) ? classes.map(String) : String(classes ?? "").split(/\s+/);
      const named = names.find((name) => name.startsWith("language-"))?.slice("language-".length);
      const language = named && named !== "text" ? named : "";

      const frame: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["md-code"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["md-code-bar"] },
            children: [
              { type: "element", tagName: "span", properties: { className: ["md-code-lang"] }, children: [{ type: "text", value: language }] },
              {
                type: "element",
                tagName: "button",
                properties: { type: "button", className: ["md-copy"], ariaLabel: "Copy code" },
                children: [
                  { type: "raw", value: COPY_ICON } as unknown as ElementContent,
                  { type: "element", tagName: "span", properties: { className: ["md-copy-label"] }, children: [{ type: "text", value: "Copy" }] },
                ],
              },
            ],
          },
          node,
        ],
      };
      (parent.children as ElementContent[])[index] = frame;
    });
  };
}

/**
 * Shiki puts each coloured block in as a nested `root` node, which text
 * extraction skips — a section of nothing but code would read as empty to the
 * search. Its children take its place.
 */
function flattenRoots() {
  return (tree: HastRoot) => {
    const flatten = (node: { children?: unknown[] }) => {
      if (!node.children) return;
      node.children = node.children.flatMap((child) => {
        const inner = child as { type: string; children?: unknown[] };
        if (inner.type === "root") {
          flatten(inner);
          return inner.children ?? [];
        }
        flatten(inner);
        return [child];
      });
    };
    flatten(tree as unknown as { children?: unknown[] });
  };
}

/**
 * A guide's task names its file on a line of its own — `File · Edit ·
 * \`project.yml\` → \`packages:\`` — and the first code on that line is the
 * path. It gets the `md-file` class, which draws it as a tag; anything after
 * it on the line is a place inside the file and stays plain code.
 */
function markFilePaths() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "p") return;
      const first = node.children.find((child) => child.type === "element" || (child.type === "text" && child.value.trim()));
      if (first?.type !== "element" || first.tagName !== "b" || toText(first).trim() !== "File") return;

      const path = node.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
      if (path) path.properties = { ...path.properties, className: ["md-file"] };
    });
  };
}

/** The labels a guide's task is written in, in order, each made a lettered step. */
const STEP_LABELS = new Set(["File", "Explain", "Think", "Code", "Try"]);
const STEP_LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** The bold label a task part starts with: a paragraph's first word, or a Code block's summary. */
function stepLabel(node: ElementContent): string | null {
  if (node.type !== "element") return null;

  if (node.tagName === "p") {
    const first = node.children.find((child) => child.type === "element" || (child.type === "text" && child.value.trim()));
    if (first?.type === "element" && first.tagName === "b") {
      const label = toText(first).trim();
      return STEP_LABELS.has(label) ? label : null;
    }
  }

  if (node.tagName === "details") {
    const summary = node.children.find((child): child is Element => child.type === "element" && child.tagName === "summary");
    return summary && toText(summary).trim() === "Code" ? "Code" : null;
  }

  return null;
}

/** A paragraph's children after its label: the " · " separators gone. */
function afterLabel(children: ElementContent[]): ElementContent[] {
  const rest = [...children];
  const dropSeparator = () => {
    while (rest[0]?.type === "text" && /^\s*·?\s*$/.test(rest[0].value)) rest.shift();
    if (rest[0]?.type === "text") rest[0] = { ...rest[0], value: rest[0].value.replace(/^\s*·\s*/, "") };
  };

  rest.shift(); // the <b> label
  dropSeparator();
  return rest;
}

function element(tagName: string, className: string, children: ElementContent[]): Element {
  return { type: "element", tagName, properties: { className: [className] }, children };
}

/**
 * Turns each task — `File · Edit · path`, `Explain · …`, `Think`, the hints, a
 * `Code` block and `Try` — into lettered steps: a heading "a. File  Edit", the
 * part's content beneath it in a body indented one small step. Letters start
 * again at each task's File line. The hints belong to Think, whose questions
 * they help with; the Code block keeps its fold, under its own heading.
 */
function stepTasks() {
  return (tree: HastRoot) => {
    visit(tree, "element", (container: Element) => {
      if (!container.children.some((child) => stepLabel(child))) return;

      const out: ElementContent[] = [];
      let body: Element | null = null;
      let count = 0;

      for (const node of container.children) {
        const label = stepLabel(node);

        if (!label) {
          // A rule between tasks ends the step it follows.
          if (node.type === "element" && node.tagName === "hr") body = null;
          (body ? body.children : out).push(node);
          continue;
        }

        if (label === "File") count = 0;
        const heading = element("p", "md-step", [
          element("span", "md-step-letter", [{ type: "text", value: `${STEP_LETTERS[count++] ?? "·"}.` }]),
          element("span", "md-step-name", [{ type: "text", value: label }]),
        ]);
        body = element("div", "md-step-body", []);
        out.push(heading, body);

        const part = node as Element;
        if (label === "Code") {
          const summary = part.children.find((child): child is Element => child.type === "element" && child.tagName === "summary");
          if (summary) summary.children = [{ type: "text", value: "Show code" }];
          // The one fold left on the page (see unfoldDetails), and closed.
          part.properties = { ...part.properties, className: ["md-code-fold"], open: undefined };
          body.children.push(part);
        } else if (label === "File" || label === "Explain") {
          let rest = afterLabel(part.children);
          // File names its kind of change next — New, Edit, Replace — which joins the heading.
          const tag = rest[0];
          if (label === "File" && tag?.type === "element" && tag.tagName === "b") {
            heading.children.push({ type: "text", value: " " }, tag);
            rest = afterLabel(rest);
          }
          if (rest.length > 0) body.children.push({ ...part, children: rest });
        }
      }

      container.children = out;
    });
  };
}

/**
 * Every fold but a task's Code becomes a plain framed block, always shown: the
 * hints, a task's group, "Adding files" and the like are read in passing, and
 * a click to open each one only slows that down. The Code fold stays — it
 * holds the answer, to be checked after trying.
 */
function unfoldDetails() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "details") return;
      const classes = node.properties?.className;
      if (Array.isArray(classes) && classes.includes("md-code-fold")) return;

      node.tagName = "div";
      node.properties = { className: ["md-panel"] };
      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "summary") {
          child.tagName = "div";
          child.properties = { className: ["md-panel-title"] };
        }
      }
    });
  };
}

/** Markdown to HTML, code coloured: what the page shows and what search reads. */
const toHast = unified()
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeShiki, {
    themes: CodeHighlight.THEMES,
    defaultColor: false,
    // Loaded up front, not lazily: pages render in parallel, and a lazy load
    // still in flight makes the blocks racing it fall back to plain text.
    langs: [...CodeHighlight.LANGUAGES, "mermaid"],
    defaultLanguage: "text",
    fallbackLanguage: "text",
    addLanguageClass: true,
  })
  .use(flattenRoots);
/** The frames, wrappers and link targets, added after the text is read for search. */
const decorate = unified()
  .use(frameCode)
  .use(markFilePaths)
  .use(stepTasks)
  .use(unfoldDetails)
  .use(wrapTables)
  .use(externalLinks);
const stringify = unified().use(rehypeStringify, { allowDangerousHtml: true });

async function render(nodes: RootContent[]): Promise<{ html: string; text: string }> {
  const hast = (await toHast.run({ type: "root", children: nodes } satisfies Root)) as HastRoot;
  const text = toText(hast).replace(/\s+/g, " ").trim();
  await decorate.run(hast);
  return { html: stringify.stringify(hast).trim(), text };
}

function oneLine(node: Parameters<typeof toString>[0]): string {
  return toString(node).replace(/\s+/g, " ").trim();
}

async function convert(
  series: Series,
  page: Page,
  part: number,
  pages: Map<string, string>,
  folders: Map<string, string>,
) {
  const repoRoot = repoRootOf(series);
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(fs.readFileSync(page.absolute, "utf8")) as Root;

  // GitHub's ids, assigned in document order so duplicates get the same -1, -2.
  const slugger = new GithubSlugger();
  visit(tree, "heading", (node: Heading) => {
    node.data = { ...node.data, hProperties: { id: slugger.slug(toString(node)) } };
  });
  visit(tree, (node) => node.type === "link" || node.type === "image" || node.type === "definition", (node) => {
    const linked = node as { url: string; type: string; data?: { hProperties?: Record<string, unknown> } };
    linked.url = rewriteUrl(linked.url, page.absolute, series, repoRoot, pages, folders);

    // A copied SVG gets its size on the <img>, for the same reason as a diagram.
    const copied = linked.url.match(new RegExp(`^\\.\\./\\.\\./${assetsUrl}/(.+\\.svg)$`));
    if (linked.type === "image" && copied) {
      const size = svgSize(fs.readFileSync(path.join(assetsDir, copied[1]), "utf8"));
      if (size) linked.data = { ...linked.data, hProperties: { ...size } };
    }
  });
  visit(tree, "code", (node: Code, index, parent) => {
    if (node.lang !== "mermaid" || !parent || index === undefined) return;
    const drawn = renderMermaid(node.value, series, page.absolute);
    if (drawn === null) return;
    const html: Html = { type: "html", value: drawn };
    parent.children[index] = html;
  });

  const h1 = tree.children.find((node): node is Heading => node.type === "heading" && node.depth === 1);
  // A folder's files are numbered by their names (01-field-work.md); a title
  // that does not carry that number gets it, so the series list reads in order
  // like the guide's "F01 — …" titles already do.
  const heading = page.part.title ?? (h1 ? toString(h1) : path.basename(page.absolute, ".md"));
  const number = page.part.dir ? path.basename(page.absolute).match(/^(\d+)-/)?.[1] : undefined;
  const title = number && !new RegExp(`^F?${number}\\b`).test(heading) ? `${number} — ${heading}` : heading;

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

  const rendered = await Promise.all(
    chunks
      .filter(({ heading }) => !DROPPED_SECTIONS.has(toString(heading)))
      .map(async ({ heading, nodes }) => ({
        id: (heading.data as { hProperties: { id: string } }).hProperties.id,
        title: toString(heading),
        blocks: [{ type: "html" as const, ...(await render(nodes)) }],
      })),
  );
  const sections: Section[] = rendered.filter((section) => section.blocks[0].html !== "");

  // The lines under the title read as the intro: list items, else paragraphs.
  const introRoot: Root = { type: "root", children: intro };
  const introLines: string[] = [];
  visit(introRoot, "listItem", (node) => {
    introLines.push(oneLine(node));
  });
  if (introLines.length === 0) {
    visit(introRoot, "paragraph", (node) => {
      introLines.push(oneLine(node));
    });
  }

  // A guide's overview names its goal; that makes the best one-line tagline.
  let goal: string | undefined;
  visit(tree, "listItem", (node) => {
    const line = oneLine(node);
    if (!goal && line.startsWith("Goal:")) goal = line.slice("Goal:".length).trim();
  });

  const words = sections.reduce((sum, section) => sum + section.blocks[0].text.split(" ").length, 0);

  return {
    dates: gitDates(repoRoot, path.relative(repoRoot, page.absolute)),
    doc: {
      title,
      tagline: goal ?? introLines[0] ?? series.name,
      icon: page.part.icon,
      topic: series.topic,
      tags: [...series.tags, ...(page.part.tags ?? [])],
      readingTime: `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min`,
      languages: ["en"],
      numbered: false,
      series: {
        id: series.id,
        part,
        name: series.name,
        ...(page.part.group && { group: page.part.group }),
      },
      intro: introLines.length > 0 ? introLines : [series.name],
      sections,
    },
  };
}

/** Removes asset files this sync neither wrote nor kept, and the folders left empty. */
function pruneAssets(dir: string) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneAssets(full);
      if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
    } else if (!usedAssets.has(full)) {
      fs.rmSync(full);
      log(`removed stale asset ${path.relative(root, full)}`);
    }
  }
}

async function sync() {
  const all = config.series.map((series) => ({ series, pages: pagesOf(series) }));

  // Every page's slug, known up front so links between them resolve — and every
  // synced folder's first page, for links that name the folder itself.
  const pages = new Map<string, string>();
  const folders = new Map<string, string>();
  for (const { series, pages: list } of all) {
    for (const page of list) pages.set(page.absolute, page.slug);
    for (const part of series.parts.filter((entry) => entry.dir)) {
      const first = list.find((page) => page.part === part);
      if (first) folders.set(path.join(repoRootOf(series), part.dir!), first.slug);
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  // Everything is converted before anything is deleted, so a sync that fails
  // half-way leaves the last good pages in place.
  const results = await Promise.all(
    all.map(async ({ series, pages: list }) => ({
      series,
      converted: await Promise.all(
        list.map(async (page, part) => ({ page, ...(await convert(series, page, part, pages, folders)) })),
      ),
    })),
  );

  for (const { series, converted } of results) {
    for (const stale of fs.readdirSync(outDir).filter((file) => file.startsWith(`${series.id}-`))) {
      fs.rmSync(path.join(outDir, stale));
    }

    // One date for the whole series, so its pages stay together and in order
    // when a search lists several of them.
    const updated = converted.map(({ dates }) => dates.last).sort().at(-1)!;

    for (const { page, dates, doc } of converted) {
      const out = path.join(outDir, `${page.slug}.json`);
      const data = { ...doc, effectiveDate: dates.first, lastUpdated: updated };
      fs.writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
      log(`${series.id}: ${path.basename(page.absolute)} → ${path.relative(root, out)} (${doc.sections.length} sections)`);
    }
  }

  pruneAssets(assetsDir);
}

await sync();
