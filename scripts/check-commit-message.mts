/**
 * Checks commit messages against the rules in commit-message.mts.
 *
 *   node scripts/check-commit-message.mts <file>          one message, as the commit-msg hook passes it
 *   node scripts/check-commit-message.mts --range A..B    every non-merge commit in a range, for CI
 *
 * Both also check who the commit is by: the author and committer the hook's
 * commit is about to get, or each commit's in the range.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { checkCommitIdentity, checkCommitMessage } from "./commit-message.mts";

const args = process.argv.slice(2);
const failures: string[] = [];

if (args[0] === "--range" && args[1]) {
  const log = execFileSync(
    "git",
    ["log", "--no-merges", "--format=%H%x00%an <%ae>%x00%cn <%ce>%x00%B%x1e", args[1]],
    { encoding: "utf8" },
  );

  for (const entry of log.split("\x1e")) {
    const [hash, author, committer, body] = entry.trim().split("\x00");
    if (!hash) continue;

    const problems = [
      checkCommitMessage(body ?? ""),
      checkCommitIdentity("author", author ?? ""),
      checkCommitIdentity("committer", committer ?? ""),
    ];
    for (const problem of problems) {
      if (problem) failures.push(`${hash.slice(0, 7)}: ${problem}`);
    }
  }
} else if (args[0]) {
  // `git var` prints `Name <email> timestamp zone`; the identity is all but the date.
  const ident = (variable: string) =>
    execFileSync("git", ["var", variable], { encoding: "utf8" }).replace(/\s+\S+\s+\S+\s*$/, "");

  const problems = [
    checkCommitMessage(readFileSync(args[0], "utf8")),
    checkCommitIdentity("author", ident("GIT_AUTHOR_IDENT")),
    checkCommitIdentity("committer", ident("GIT_COMMITTER_IDENT")),
  ];
  for (const problem of problems) {
    if (problem) failures.push(problem);
  }
} else {
  console.error("usage: check-commit-message.mts <file> | --range <A..B>");
  process.exit(2);
}

if (failures.length > 0) {
  console.error("Commits must follow Conventional Commits and carry no AI trace, in the message or the author (see docs/claude/commits.md):");
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
