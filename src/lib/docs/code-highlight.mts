/**
 * How code is coloured, shared by the guides' code blocks (highlighted when a
 * page is built) and the synced Markdown (highlighted by `npm run docs:sync`),
 * so the two look the same.
 *
 * Colours come as CSS variables for both themes at once (`defaultColor:
 * false`); globals.css picks one by the reader's colour scheme, as the rest of
 * the site does. `.mts` and import-free, like ResourceConstant, so the plain
 * Node sync script can import it by path.
 */
export class CodeHighlight {
  /** GitHub's own themes: code reads as it does in the docs on GitHub. */
  static readonly THEMES = { light: "github-light", dark: "github-dark" } as const;

  /** Every language a guide's code block names, by Shiki's name for it. */
  static readonly LANGUAGES = [
    "bash",
    "css",
    "dart",
    "groovy",
    "html",
    "java",
    "javascript",
    "json",
    "jsonc",
    "jsx",
    "kotlin",
    "objective-c",
    "powershell",
    "ruby",
    "sql",
    "swift",
    "tsx",
    "typescript",
    "xml",
    "yaml",
  ] as const;

  /** A guide's own names for languages Shiki spells differently. */
  static readonly ALIASES: Record<string, string> = {
    objectivec: "objective-c",
    ts: "typescript",
    js: "javascript",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
  };

  // Static members only: the class is a namespace, and there is nothing to construct.
  private constructor() {}
}
