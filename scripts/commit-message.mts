/**
 * The commit message rules: Conventional Commits, and no trace of an AI tool.
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

/**
 * What an AI coding tool adds to a message: a co-author trailer, a session
 * link, a "Generated with" footer. The history reads as the author's own work,
 * so none of it may reach main. The word "claude" alone stays allowed: the
 * agent rules live in `docs/claude/` and commits name that scope.
 */
const AI_TRACES: [RegExp, string][] = [
  [/^co-authored-by:/im, "a Co-Authored-By trailer"],
  [/^claude-session:/im, "a Claude-Session trailer"],
  [/generated (with|by) \[?claude/i, "a \"Generated with Claude\" footer"],
  [/noreply@anthropic\.com/i, "an Anthropic address"],
  [/claude\.(ai|com)\/code/i, "a Claude Code link"],
  [/\u{1F916}/u, "the robot emoji"],
];

/** An AI tool's own git identity, as `Name <email>`. */
const AI_IDENTITY = /^claude\b|noreply@anthropic\.com/i;

/**
 * Why a commit's author or committer (`Name <email>`) may not land, or null.
 * A tool that commits under its own name puts that name on main.
 */
export function checkCommitIdentity(role: string, ident: string): string | null {
  return AI_IDENTITY.test(ident.trim())
    ? `the ${role} is "${ident.trim()}"; commit as yourself (git config user.name / user.email).`
    : null;
}

/** The longest subject line allowed, including the type prefix. */
export const MAX_HEADER_LENGTH = 72;

/**
 * Why `message` breaks the rule, or null if it keeps it. Comment lines, which
 * git strips before committing, are ignored.
 */
export function checkCommitMessage(message: string): string | null {
  const lines = message.split("\n").filter((line) => !line.startsWith("#"));
  const header = lines.find((line) => line.trim() !== "")?.trimEnd();

  if (!header) return "the message is empty";

  // Before the pass for git's own messages: a fixup or a squash carries its
  // body to main as well.
  const trace = AI_TRACES.find(([pattern]) => pattern.test(lines.join("\n")));
  if (trace) return `the message carries ${trace[1]}; remove it.`;

  if (GENERATED.test(header)) return null;

  if (!HEADER.test(header)) {
    return `"${header}" does not start with a type, e.g. "feat: …" or "fix(cv): …". Types: ${Object.keys(COMMIT_TYPES).join(", ")}.`;
  }

  if (header.length > MAX_HEADER_LENGTH) {
    return `the first line is ${header.length} characters; keep it to ${MAX_HEADER_LENGTH}.`;
  }

  return null;
}
