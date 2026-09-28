/**
 * The shape of a guide, in one language.
 *
 * A guide is two files — `<slug>_en.json` and `<slug>_vi.json` — each a whole
 * guide on its own, so nothing here knows about translation. What keeps the two
 * in step is `tests/doc-data.test.ts`, which fails if they stop matching
 * structurally.
 *
 * Kept apart from the loader in `docs.ts` because the guide pages render in a
 * client component to switch language without a navigation — importing anything
 * that touches `node:fs` from there fails the build.
 */

/** Every language a guide is written in. Both are required, never a fallback. */
export const LANGUAGES = ["en", "vi"] as const;

export type Lang = (typeof LANGUAGES)[number];

/**
 * The colour of the whole guides section.
 *
 * One colour, not one per guide: the accent marks section numbers, diagram
 * boxes and the language switch, and a guide that arrived in its own colour
 * made the set read as unrelated pages. The app policies are the opposite case
 * — there the colour belongs to the app, so it stays in their data.
 */
export const DOCS_ACCENT = "#0ea5e9";

export const LANGUAGE_LABELS: Record<Lang, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

/** The block types a guide is built from. */
export type Block =
  /** A sub-heading inside a section, for the "one way / the other way" splits. */
  | { type: "heading"; text: string }
  | { type: "text"; body: string[] }
  | { type: "list"; items: string[] }
  /** Same data as a list, drawn with boxes because the reader ticks it off. */
  | { type: "checklist"; items: string[] }
  /** An ordered list, for steps that only work in the given order. */
  | { type: "steps"; items: string[] }
  /**
   * A command sample. The commands are identical in both languages — anything
   * that needs explaining goes in the caption instead of a comment, so the code
   * stays copy-pasteable and the prose stays translated.
   */
  | { type: "code"; language: string; caption?: string; code: string[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "note"; tone: "info" | "warning"; body: string[] }
  /**
   * A diagram, described as data rather than markup: stages run top to bottom
   * with an arrow between them, and the boxes within one stage sit side by side.
   * One box per stage draws a pipeline; several boxes feeding one draws a join.
   */
  | {
      type: "flow";
      caption?: string;
      stages: { items: FlowItem[] }[];
    };

/**
 * One box in a diagram, written at three depths of the same step.
 *
 * `label` names it and `detail` says what happens in one phrase — both are on
 * the box itself, which is all a reader skimming the diagram gets. `explain` is
 * the long answer, and it opens in a dialog when the box is clicked: the step
 * finally gets the paragraphs it deserves without the diagram growing into a
 * wall of text.
 *
 * All three are required. A box the reader can click has to have something
 * waiting behind it, so there is no such thing as a box that only names a step.
 */
export type FlowItem = {
  label: string;
  detail: string;
  /**
   * The long version, in points rather than paragraphs — the same rule the rest
   * of a guide follows, because a dialog is read standing at a machine too.
   */
  explain: string[];
};

/** Named shortcuts for the block types that have a renderer of their own. */
export type CodeBlock = Extract<Block, { type: "code" }>;
export type TableBlock = Extract<Block, { type: "table" }>;
export type NoteBlock = Extract<Block, { type: "note" }>;
export type FlowBlock = Extract<Block, { type: "flow" }>;

export type DocSection = {
  /**
   * Anchor id. The same in both languages, so switching language keeps the
   * reader where they were.
   */
  id: string;
  title: string;
  /** One line under the heading, also used as the blurb in the index. */
  summary?: string;
  blocks: Block[];
};

/** The shape of one file in src/data/docs. */
export type DocData = {
  title: string;
  tagline: string;
  icon: string;
  /** Product names, left untranslated. */
  tags: string[];
  readingTime: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string[];
  sections: DocSection[];
};

/** One guide in one language. The slug comes from the filename. */
export type Doc = DocData & { slug: string };

/**
 * Every language's version of one guide.
 *
 * The page ships all of them and picks one in the browser, so switching is a
 * re-render with nothing left to fetch.
 */
export type DocBundle = {
  slug: string;
  versions: Record<Lang, Doc>;
};
