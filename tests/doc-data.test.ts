import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LANGUAGES,
  type Block,
  type CodeBlock,
  type Doc,
} from "@/lib/docs/doc-model";
import { getDocBundles } from "@/lib/docs/docs";
import { ResourceConstant } from "@/lib/resource-constant.mts";
import { RESERVED_SLUGS } from "@/lib/routes/routes";

const docsDir = path.join(process.cwd(), ResourceConstant.DOCS_DIR);

const ALLOWED_KEYS = new Set([
  "title",
  "tagline",
  "icon",
  "tags",
  "readingTime",
  "effectiveDate",
  "lastUpdated",
  "intro",
  "sections",
]);

/** Every member of the Block union. A new type has to be added here too. */
const BLOCK_TYPES = new Set([
  "heading",
  "text",
  "list",
  "checklist",
  "steps",
  "code",
  "table",
  "note",
  "flow",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A guide must stay short enough to be read standing at a new machine, so no
 * single sentence-or-paragraph is allowed to sprawl. Splitting the point into
 * two entries, a list or a table is always the fix.
 */
const MAX_STRING_LENGTH = 280;

/** A diagram box explains itself in a phrase — long enough to say something. */
const MIN_DETAIL_LENGTH = 30;
const MAX_DETAIL_LENGTH = 110;

/**
 * And behind the box, the long version the dialog opens on: enough points to be
 * worth the click, few enough to read in one dialog, and each one a whole
 * thought rather than the detail typed out a second time.
 *
 * The ceiling is six because a box that names a term — SNI, SPKI, a cipher
 * suite — owes the reader the definition and a worked example with real values,
 * not just the sentence it was already printed with.
 */
const MIN_EXPLAIN_POINTS = 2;
const MAX_EXPLAIN_POINTS = 6;
const MIN_EXPLAIN_LENGTH = 60;

/**
 * A guide with the translated words taken out.
 *
 * The two language files are separate documents now, so nothing but a test
 * stops them drifting: a section added to one and not the other, a table that
 * grew a row on one side, a command edited in English only. Comparing the
 * skeletons catches all of it in one assertion, and the diff names the part
 * that moved.
 */
function skeleton(doc: Doc) {
  return {
    icon: doc.icon,
    tags: doc.tags,
    effectiveDate: doc.effectiveDate,
    lastUpdated: doc.lastUpdated,
    introParagraphs: doc.intro.length,
    sections: doc.sections.map((section) => ({
      id: section.id,
      hasSummary: section.summary !== undefined,
      blocks: section.blocks.map(blockSkeleton),
    })),
  };
}

function blockSkeleton(block: Block) {
  switch (block.type) {
    case "heading":
      return { type: block.type };
    case "text":
      return { type: block.type, paragraphs: block.body.length };
    case "note":
      return { type: block.type, tone: block.tone, paragraphs: block.body.length };
    case "list":
    case "checklist":
    case "steps":
      return { type: block.type, items: block.items.length };
    case "code":
      // Commands are the same in every language; only the caption is written
      // twice, so the code itself is compared rather than counted.
      return { type: block.type, language: block.language, code: block.code };
    case "table":
      return {
        type: block.type,
        columns: block.columns.length,
        rows: block.rows.map((row) => row.length),
      };
    case "flow":
      return {
        type: block.type,
        hasCaption: block.caption !== undefined,
        // Counted down to the box: a point added to one language's dialog and
        // not the other is drift that a count of the boxes alone would miss.
        stages: block.stages.map((stage) =>
          stage.items.map((item) => item.explain.length),
        ),
      };
  }
}

/**
 * Every string a reader sees, with the path that leads to it.
 *
 * Command samples are skipped apart from their caption: a blank line inside one
 * is deliberate spacing, and the commands are not prose to be measured.
 */
function strings(value: unknown, at = "doc"): [string, string][] {
  if (typeof value === "string") return [[at, value]];

  if (isCodeBlock(value)) {
    return value.caption === undefined ? [] : [[`${at}.caption`, value.caption]];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => strings(item, `${at}[${index}]`));
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      strings(child, `${at}.${key}`),
    );
  }

  return [];
}

function isCodeBlock(value: unknown): value is CodeBlock {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Block).type === "code"
  );
}

const bundles = getDocBundles();

describe("doc files", () => {
  it("holds nothing but a folder per language", () => {
    expect(fs.readdirSync(docsDir).sort()).toEqual([...LANGUAGES].sort());
  });

  it("names every file after its slug and its language", () => {
    // The suffix repeats the folder on purpose: an editor tab shows only the
    // filename, and a file in the wrong folder stops matching.
    for (const lang of LANGUAGES) {
      const misnamed = fs
        .readdirSync(path.join(docsDir, lang))
        .filter((file) => !file.endsWith(`_${lang}.json`));

      expect(misnamed).toEqual([]);
    }
  });

  it("has the same guides under every language", () => {
    // A file added to one folder and not the other is the easy mistake now that
    // a guide is two documents rather than one.
    const [first, ...rest] = LANGUAGES.map((lang) =>
      fs
        .readdirSync(path.join(docsDir, lang))
        .map((file) => file.replace(`_${lang}.json`, ""))
        .sort(),
    );

    for (const other of rest) {
      expect(other).toEqual(first);
    }
  });

  it("loads at least one guide", () => {
    expect(bundles.length).toBeGreaterThan(0);
  });

  it("lists the most recently updated guide first", () => {
    const updated = bundles.map((bundle) => bundle.versions.en.lastUpdated);

    expect(updated).toEqual([...updated].sort().reverse());
  });

  it("has both languages of every guide on disk", () => {
    // The loader throws on a missing half; this states the rule where a reader
    // of the tests will find it.
    for (const bundle of bundles) {
      for (const lang of LANGUAGES) {
        expect(fs.readdirSync(path.join(docsDir, lang))).toContain(
          `${bundle.slug}_${lang}.json`,
        );
      }
    }
  });
});

describe.each(bundles.map((bundle) => [bundle.slug, bundle] as const))(
  "%s",
  (slug, bundle) => {
    it("has a url-safe slug that no top-level section shadows", () => {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect([...RESERVED_SLUGS] as string[]).not.toContain(slug);
    });

    it("is the same document in both languages", () => {
      expect(skeleton(bundle.versions.vi)).toEqual(skeleton(bundle.versions.en));
    });

    describe.each(LANGUAGES)("%s", (lang) => {
      const doc = bundle.versions[lang];
      const blocks: Block[] = doc.sections.flatMap((section) => section.blocks);

      it("uses only known fields", () => {
        const unknown = Object.keys(doc).filter(
          (key) => key !== "slug" && !ALLOWED_KEYS.has(key),
        );

        expect(unknown).toEqual([]);
      });

      it("has no empty strings", () => {
        const blank = strings(doc)
          .filter(([, text]) => text.trim() === "")
          .map(([at]) => at);

        expect(blank).toEqual([]);
      });

      it("keeps every string short enough to scan", () => {
        const sprawling = strings(doc)
          .filter(([, text]) => text.length > MAX_STRING_LENGTH)
          .map(([at, text]) => `${at}: ${text.length} chars`);

        expect(sprawling).toEqual([]);
      });

      it("is written in points, not paragraphs", () => {
        // A guide is read standing at a machine, so the content belongs in
        // lists, steps and tables. One block of prose per section is the
        // ceiling; a second one means the point wants breaking up.
        const wordy = doc.sections
          .filter(
            (section) =>
              section.blocks.filter((block) => block.type === "text").length > 1,
          )
          .map((section) => section.id);

        expect(wordy).toEqual([]);
      });

      it("illustrates itself with at least one diagram", () => {
        expect(
          blocks.filter((block) => block.type === "flow").length,
        ).toBeGreaterThan(0);
      });

      it("has tags and an intro", () => {
        expect(doc.tags.length).toBeGreaterThan(0);
        expect(doc.intro.length).toBeGreaterThan(0);
      });

      it("has valid dates that are not in the wrong order", () => {
        expect(doc.effectiveDate).toMatch(ISO_DATE);
        expect(doc.lastUpdated).toMatch(ISO_DATE);

        expect(Date.parse(doc.lastUpdated)).toBeGreaterThanOrEqual(
          Date.parse(doc.effectiveDate),
        );
      });

      it("has sections with unique, language-independent anchor ids", () => {
        const ids = doc.sections.map((section) => section.id);

        expect(new Set(ids).size).toBe(ids.length);

        for (const id of ids) {
          expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        }
      });

      it("has a non-empty body in every section", () => {
        expect(doc.sections.length).toBeGreaterThan(0);

        for (const section of doc.sections) {
          expect(section.blocks.length).toBeGreaterThan(0);
        }
      });

      it("only uses block types the renderer knows how to draw", () => {
        const unknown = blocks
          .map((block) => block.type)
          .filter((type) => !BLOCK_TYPES.has(type));

        expect(unknown).toEqual([]);
      });

      it("has content in every block", () => {
        for (const block of blocks) {
          switch (block.type) {
            case "heading":
              break;
            case "text":
            case "note":
              expect(block.body.length).toBeGreaterThan(0);
              break;
            case "list":
            case "checklist":
            case "steps":
              expect(block.items.length).toBeGreaterThan(0);
              break;
            case "code":
              expect(block.code.length).toBeGreaterThan(0);
              expect(block.language.trim()).not.toBe("");
              break;
            case "table":
              expect(block.columns.length).toBeGreaterThan(0);
              expect(block.rows.length).toBeGreaterThan(0);
              break;
            case "flow":
              expect(block.stages.length).toBeGreaterThan(1);
              break;
          }
        }
      });

      it("gives every table row a cell per column", () => {
        for (const block of blocks) {
          if (block.type !== "table") continue;

          for (const row of block.rows) {
            expect(row).toHaveLength(block.columns.length);
          }
        }
      });

      it("explains every box in a diagram", () => {
        // A diagram is read on its own, so a label that only names a step is
        // not enough — and an explanation that runs long stops being scannable.
        const bad: string[] = [];

        for (const block of blocks) {
          if (block.type !== "flow") continue;

          for (const stage of block.stages) {
            expect(stage.items.length).toBeGreaterThan(0);

            for (const item of stage.items) {
              const length = item.detail.trim().length;

              if (length < MIN_DETAIL_LENGTH || length > MAX_DETAIL_LENGTH) {
                bad.push(`${item.label}: ${length} chars`);
              }
            }
          }
        }

        expect(bad).toEqual([]);
      });

      it("has the long version behind every diagram box", () => {
        // Every box opens a dialog, so every box owes the reader more than the
        // phrase already printed on it — and owes it in points, not one lump.
        const bad: string[] = [];

        for (const block of blocks) {
          if (block.type !== "flow") continue;

          for (const stage of block.stages) {
            for (const item of stage.items) {
              const points = item.explain.map((point) => point.trim());

              if (
                points.length < MIN_EXPLAIN_POINTS ||
                points.length > MAX_EXPLAIN_POINTS
              ) {
                bad.push(`${item.label}: ${points.length} points`);
              }

              for (const point of points) {
                if (point.length < MIN_EXPLAIN_LENGTH) {
                  bad.push(`${item.label}: a point of ${point.length} chars`);
                }

                if (point === item.detail.trim()) {
                  bad.push(`${item.label}: a point repeating the detail`);
                }
              }
            }
          }
        }

        expect(bad).toEqual([]);
      });

      it("uses a note tone the callout has styling for", () => {
        for (const block of blocks) {
          if (block.type !== "note") continue;

          expect(["info", "warning"]).toContain(block.tone);
        }
      });
    });
  },
);
