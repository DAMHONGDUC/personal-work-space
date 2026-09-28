/**
 * Searching the guides, in the browser.
 *
 * The site is a static export, so there is no search endpoint and no index to
 * fetch: the guide index page already ships every guide it lists, and this walks
 * what is in memory. That is affordable because a guide is a few dozen short
 * strings, and it means the search covers the whole text — including the points
 * behind a diagram box, which is usually where a term like SNI is defined.
 */
import type { Doc, DocSection } from "@/lib/docs/doc-model";

/** One guide that matched, carrying the sections that matched inside it. */
export type DocMatch = {
  doc: Doc;
  /**
   * The sections worth linking for this query. Sections that matched, or all of
   * them when the guide itself matched by title, tagline or tag.
   */
  sections: DocSection[];
};

/**
 * Fields that name a shape rather than say anything: without this, searching
 * for "note" or "text" matches every guide on the site.
 */
const STRUCTURAL_KEYS = new Set(["type", "tone", "language"]);

/**
 * Lowercased, and with Vietnamese diacritics removed.
 *
 * Both halves of the site are searched by people typing on whichever keyboard
 * they have to hand, so "ma hoa" has to find "mã hoá" and "chung chi" has to
 * find "chứng chỉ". Stripping the marks from both the text and the query makes
 * that one comparison rather than a table of special cases.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

/** Every string a reader can see in a block, structure excluded. */
function textIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textIn);

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .filter(([key]) => !STRUCTURAL_KEYS.has(key))
      .flatMap(([, child]) => textIn(child));
  }

  return [];
}

// Flattening a section costs more than the comparison does, and the same
// sections are searched again on every keystroke — so each is flattened once and
// kept for as long as the doc object lives.
const sectionCache = new WeakMap<DocSection, string>();
const headerCache = new WeakMap<Doc, string>();

function sectionText(section: DocSection): string {
  const cached = sectionCache.get(section);
  if (cached !== undefined) return cached;

  const text = normalize(textIn(section).join(" "));
  sectionCache.set(section, text);

  return text;
}

/** Title, tagline, tags and intro — what the card shows before you open it. */
function headerText(doc: Doc): string {
  const cached = headerCache.get(doc);
  if (cached !== undefined) return cached;

  const text = normalize(
    [doc.slug, doc.title, doc.tagline, ...doc.tags, ...doc.intro].join(" "),
  );
  headerCache.set(doc, text);

  return text;
}

/**
 * The guides matching `query`, in the order they were given.
 *
 * Terms are ANDed: "flutter clean" finds the guide that has both words, not
 * every guide that mentions either. A guide matches when its header holds all
 * of them, or when a single section does — so a term used only inside one
 * section still finds the guide, and the card then lists that section alone.
 */
export function searchDocs(docs: Doc[], query: string): DocMatch[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return docs.map((doc) => ({ doc, sections: doc.sections }));
  }

  const matches: DocMatch[] = [];

  for (const doc of docs) {
    const sections = doc.sections.filter((section) => {
      const text = sectionText(section);
      return terms.every((term) => text.includes(term));
    });

    const header = headerText(doc);
    const headerMatches = terms.every((term) => header.includes(term));

    if (sections.length > 0) {
      matches.push({ doc, sections });
    } else if (headerMatches) {
      // The guide is what matched, not one part of it, so the card stays whole.
      matches.push({ doc, sections: doc.sections });
    }
  }

  return matches;
}
