/**
 * Checks commit messages against the Conventional Commits rule.
 *
 *   node scripts/check-commit-message.mts <file>          one message, as the commit-msg hook passes it
 *   node scripts/check-commit-message.mts --range A..B    every non-merge commit in a range, for CI
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { checkCommitMessage } from "./commit-message.mts";

const args = process.argv.slice(2);
const failures: string[] = [];

if (args[0] === "--range" && args[1]) {
  const log = execFileSync("git", ["log", "--no-merges", "--format=%H%x00%B%x1e", args[1]], {
    encoding: "utf8",
  });

  for (const entry of log.split("\x1e")) {
    const [hash, body] = entry.trim().split("\x00");
    if (!hash) continue;

    const problem = checkCommitMessage(body ?? "");
    if (problem) failures.push(`${hash.slice(0, 7)}: ${problem}`);
  }
} else if (args[0]) {
  const problem = checkCommitMessage(readFileSync(args[0], "utf8"));
  if (problem) failures.push(problem);
} else {
  console.error("usage: check-commit-message.mts <file> | --range <A..B>");
  process.exit(2);
}

if (failures.length > 0) {
  console.error("Commit messages must follow Conventional Commits (see CLAUDE.md → Commits):");
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
