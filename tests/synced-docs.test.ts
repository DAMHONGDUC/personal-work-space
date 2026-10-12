import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DOC_TOPICS, type Doc } from "@/lib/docs/doc-model";
import { getDocBundles, getSyncedDocBundles } from "@/lib/docs/docs";
import { ResourceConstant } from "@/lib/resource-constant.mts";
import { RESERVED_SLUGS } from "@/lib/routes/routes";

/**
 * The guides `npm run docs:sync` writes. They are not held to the rules of a
 * guide written for this site — one language, no diagram, the Markdown's own
 * prose — but they must still render: every page complete, every series in
 * order, and every link and image they carry pointing at something that exists.
 */
const synced = getSyncedDocBundles();
const docs: Doc[] = synced.map((bundle) => bundle.versions.en);
const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), ResourceConstant.SYNCED_DOCS_CONFIG), "utf8"),
) as { topic: string; series: { id: string }[] };

/** Every anchor a page can be linked to: its sections and the headings inside them. */
function anchorsOf(doc: Doc): Set<string> {
  const ids = new Set(doc.sections.map((section) => section.id));

  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.type !== "html") continue;
      for (const [, id] of block.html.matchAll(/\sid="([^"]+)"/g)) ids.add(id);
    }
  }

  return ids;
}

const allDocs = new Map(getDocBundles().map((bundle) => [bundle.slug, bundle.versions.en]));

describe("synced guides", () => {
  it("has a page for every configured series", () => {
    for (const series of config.series) {
      expect(docs.some((doc) => doc.series?.id === series.id)).toBe(true);
    }
  });

  it("numbers every series from 0, with no gaps", () => {
    for (const series of config.series) {
      const parts = docs
        .filter((doc) => doc.series?.id === series.id)
        .map((doc) => doc.series!.part)
        .sort((a, b) => a - b);

      expect(parts).toEqual(parts.map((_, index) => index));
    }
  });
});

describe.each(docs.map((doc) => [doc.slug, doc] as const))("%s", (slug, doc) => {
  it("has a url-safe slug that no top-level section shadows", () => {
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect([...RESERVED_SLUGS] as string[]).not.toContain(slug);
  });

  it("is English only, keeps its own numbers, and sits on a known shelf", () => {
    expect(doc.languages).toEqual(["en"]);
    expect(doc.numbered).toBe(false);
    expect([...DOC_TOPICS] as string[]).toContain(doc.topic);
  });

  it("has a title, a tagline, an intro and valid dates", () => {
    expect(doc.title.trim()).not.toBe("");
    expect(doc.tagline.trim()).not.toBe("");
    expect(doc.intro.length).toBeGreaterThan(0);
    expect(Date.parse(doc.lastUpdated)).toBeGreaterThanOrEqual(Date.parse(doc.effectiveDate));
  });

  it("has sections with unique ids, each holding rendered HTML and its text", () => {
    const ids = doc.sections.map((section) => section.id);

    expect(doc.sections.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);

    for (const section of doc.sections) {
      expect(section.blocks.length).toBeGreaterThan(0);
      for (const block of section.blocks) {
        expect(block.type).toBe("html");
        if (block.type !== "html") continue;
        expect(block.html.trim()).not.toBe("");
        expect(block.text.trim()).not.toBe("");
      }
    }
  });

  it("letters every task's parts from a. File, and shows its path as a tag", () => {
    const wrong: string[] = [];

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.type !== "html") continue;

        // The body is read by lookahead, so it does not swallow the next step's heading.
        const steps = [
          ...block.html.matchAll(
            /<p class="md-step"><span class="md-step-letter">(\w)\.<\/span><span class="md-step-name">(\w+)<\/span>[\s\S]*?<\/p><div class="md-step-body">(?=([\s\S]{0,400}))/g,
          ),
        ];
        let expected = 0;
        for (const [, letter, name, body] of steps) {
          if (name === "File") expected = 0;
          if (letter !== "abcdefghijklmnopqrstuvwxyz"[expected++]) wrong.push(`${section.id}: ${letter}. ${name}`);
          if (name === "File" && body.includes("<code") && !/^\s*<p><code class="md-file">/.test(body)) {
            wrong.push(`${section.id}: File path not tagged`);
          }
        }
        // No task label is left as a plain bold paragraph.
        if (/<p><b>(File|Explain|Think|Try)<\/b>/.test(block.html)) wrong.push(`${section.id}: unlettered part`);
      }
    }

    expect(wrong).toEqual([]);
  });

  it("folds nothing but a task's code", () => {
    const folds: string[] = [];

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.type !== "html") continue;

        for (const [details] of block.html.matchAll(/<details[^>]*>\s*<summary>[^<]*/g)) {
          if (!/class="md-code-fold"/.test(details) || /\sopen/.test(details) || !details.endsWith("Show code")) {
            folds.push(`${section.id}: ${details.slice(0, 80)}`);
          }
        }
      }
    }

    expect(folds).toEqual([]);
  });

  it("drops the Markdown's own table of contents", () => {
    expect(doc.sections.map((section) => section.title)).not.toContain("Contents");
  });

  it("links only to pages and anchors that exist", () => {
    // Synced pages link to each other relatively: ../<slug>/#<anchor>.
    const broken: string[] = [];

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.type !== "html") continue;

        for (const [, target, anchor] of block.html.matchAll(/href="\.\.\/([^"/]+)\/(?:#([^"]*))?"/g)) {
          const page = allDocs.get(target);
          if (!page) broken.push(`${section.id}: no page ${target}`);
          else if (anchor && !anchorsOf(page).has(anchor)) broken.push(`${section.id}: no #${anchor} in ${target}`);
        }

        for (const [, anchor] of block.html.matchAll(/href="#([^"]+)"/g)) {
          if (!anchorsOf(doc).has(anchor)) broken.push(`${section.id}: no #${anchor}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it("shows only images that were copied into public/", () => {
    const assetsUrl = path.relative("public", ResourceConstant.SYNCED_DOCS_ASSETS_DIR);
    const missing: string[] = [];

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.type !== "html") continue;

        for (const [, src] of block.html.matchAll(/src="([^"]+)"/g)) {
          if (/^https?:/.test(src)) continue;
          const file = src.replace(/^(\.\.\/)+/, "");
          if (!file.startsWith(`${assetsUrl}/`) || !fs.existsSync(path.join("public", file))) {
            missing.push(src);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
