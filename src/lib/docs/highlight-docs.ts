/**
 * Colours the guides' code blocks when a page is built. Server-only: Shiki and
 * its grammars stay out of the browser, which receives the finished HTML on
 * each block's `highlighted`.
 */
import { createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { CodeHighlight } from "@/lib/docs/code-highlight.mts";
import type { Block, Doc, Lang } from "@/lib/docs/doc-model";

/** One highlighter for the whole build; creating it loads every grammar once. */
let highlighter: Promise<Highlighter> | null = null;

function shared(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: Object.values(CodeHighlight.THEMES),
    langs: [...CodeHighlight.LANGUAGES],
    // The JavaScript engine needs no WebAssembly, which keeps the build simple.
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** The code as coloured HTML; a language Shiki does not know is shown as plain text. */
export async function highlightCode(code: string, language: string): Promise<string> {
  const shiki = await shared();
  const name = CodeHighlight.ALIASES[language] ?? language;
  const lang = shiki.getLoadedLanguages().includes(name) ? name : "text";

  return shiki.codeToHtml(code, { lang, themes: CodeHighlight.THEMES, defaultColor: false });
}

async function highlightBlock(block: Block): Promise<Block> {
  if (block.type !== "code") return block;
  return { ...block, highlighted: await highlightCode(block.code.join("\n"), block.language) };
}

/** Every language's version of a guide, with its code blocks coloured. */
export async function highlightVersions(versions: Record<Lang, Doc>): Promise<Record<Lang, Doc>> {
  const entries = await Promise.all(
    Object.entries(versions).map(async ([lang, doc]) => [
      lang,
      {
        ...doc,
        sections: await Promise.all(
          doc.sections.map(async (section) => ({
            ...section,
            blocks: await Promise.all(section.blocks.map(highlightBlock)),
          })),
        ),
      },
    ]),
  );
  return Object.fromEntries(entries) as Record<Lang, Doc>;
}
