/**
 * Reads the guides off disk. Server-only: it opens the filesystem, so nothing
 * rendered in the browser may import it. The shape it returns lives in
 * `doc-model.ts`, which is safe to import from anywhere.
 */
import fs from "node:fs";
import path from "node:path";
import {
  LANGUAGES,
  type Doc,
  type DocBundle,
  type DocData,
  type Lang,
} from "@/lib/docs/doc-model";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const docsDir = path.join(process.cwd(), ResourceConstant.DOCS_DIR);

/**
 * `src/data/docs/<lang>/<slug>_<lang>.json`.
 *
 * The language is in the folder and again in the filename. The repetition is
 * deliberate: an editor tab shows the filename and not the folder, so the tab
 * says which language you are editing — and a file dropped into the wrong
 * folder no longer matches, which is what the check below reports.
 */
function langDir(lang: Lang): string {
  return path.join(docsDir, lang);
}

/** The slug of a file in a language folder, or null if it is misnamed. */
function slugOf(lang: Lang, file: string): string | null {
  const suffix = `_${lang}.json`;

  return file.endsWith(suffix) ? file.slice(0, -suffix.length) : null;
}

function read(lang: Lang, file: string): DocData {
  const raw = fs.readFileSync(path.join(langDir(lang), file), "utf8");

  try {
    return JSON.parse(raw) as DocData;
  } catch (error) {
    throw new Error(
      `${ResourceConstant.DOCS_DIR}/${lang}/${file} is not valid JSON: ${(error as Error).message}`,
    );
  }
}

/**
 * Every guide, most recently updated first, read fresh so adding a file is
 * picked up by a refresh in dev. Like the apps loader this only runs at build
 * time — every route is prerendered — so there is nothing to cache.
 *
 * The same slug must exist under every language folder. A guide missing one
 * throws rather than rendering: there is no fallback, because half a page in
 * the wrong language is worse than a build that stops and names the file.
 */
export function getDocBundles(): DocBundle[] {
  const found = new Map<string, Partial<Record<Lang, Doc>>>();

  for (const lang of LANGUAGES) {
    for (const file of fs.readdirSync(langDir(lang))) {
      if (!file.endsWith(".json")) continue;

      const slug = slugOf(lang, file);
      if (slug === null) {
        throw new Error(
          `${ResourceConstant.DOCS_DIR}/${lang}/${file} should be named <slug>_${lang}.json`,
        );
      }

      const versions = found.get(slug) ?? {};

      versions[lang] = { slug, ...read(lang, file) };
      found.set(slug, versions);
    }
  }

  return [...found.entries()]
    .map(([slug, versions]) => {
      const missing = LANGUAGES.filter((lang) => !versions[lang]);

      if (missing.length > 0) {
        throw new Error(
          `${missing
            .map((lang) => `${ResourceConstant.DOCS_DIR}/${lang}/${slug}_${lang}.json`)
            .join(" and ")} is missing`,
        );
      }

      return { slug, versions: versions as Record<Lang, Doc> };
    })
    .sort((a, b) =>
      b.versions.en.lastUpdated.localeCompare(a.versions.en.lastUpdated),
    );
}

export function getDocBundle(slug: string): DocBundle | undefined {
  return getDocBundles().find((bundle) => bundle.slug === slug);
}
