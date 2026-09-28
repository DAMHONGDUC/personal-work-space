/**
 * The commit message rule: Conventional Commits.
 *
 *   type(optional-scope)!: subject
 *
 * Shared by the local commit-msg hook (.githooks/commit-msg) and the CI step
 * that checks every commit in a pull request, so the two can never disagree.
 * Imports nothing, so bare Node can run it without a build.
 */

/** Every type a commit may start with, and what it is for. */
export const COMMIT_TYPES = {
  feat: "a feature a reader or visitor can see",
  fix: "a bug fix",
  docs: "documentation only: READMEs, CLAUDE.md, comments",
  style: "formatting with no change in behaviour",
  refactor: "a code change that neither fixes a bug nor adds a feature",
  perf: "a change that makes something faster or smaller",
  test: "tests only",
  build: "the build, dependencies or scripts",
  ci: "the GitHub workflows",
  chore: "anything else that touches no shipped behaviour",
  revert: "undoing an earlier commit",
} as const;

const HEADER = new RegExp(
  `^(${Object.keys(COMMIT_TYPES).join("|")})(\\([a-z0-9][a-z0-9-]*\\))?!?: \\S.*$`,
);

/** Messages git writes itself, which the rule leaves alone. */
const GENERATED = /^(Merge |Revert "|fixup! |squash! |amend! )/;

/** The longest subject line allowed, including the type prefix. */
export const MAX_HEADER_LENGTH = 72;

/**
 * Why `message` breaks the rule, or null if it keeps it. Comment lines, which
 * git strips before committing, are ignored.
 */
export function checkCommitMessage(message: string): string | null {
  const header = message
    .split("\n")
    .find((line) => line.trim() !== "" && !line.startsWith("#"))
    ?.trimEnd();

  if (!header) return "the message is empty";
  if (GENERATED.test(header)) return null;

  if (!HEADER.test(header)) {
    return `"${header}" does not start with a type, e.g. "feat: …" or "fix(cv): …". Types: ${Object.keys(COMMIT_TYPES).join(", ")}.`;
  }

  if (header.length > MAX_HEADER_LENGTH) {
    return `the first line is ${header.length} characters; keep it to ${MAX_HEADER_LENGTH}.`;
  }

  return null;
}
