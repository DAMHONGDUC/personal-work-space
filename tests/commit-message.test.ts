import { describe, expect, it } from "vitest";
import { checkCommitMessage, MAX_HEADER_LENGTH } from "../scripts/commit-message.mts";

describe("commit messages", () => {
  it.each([
    "feat: add the portfolio",
    "fix(cv): keep the download name",
    "refactor(docs)!: move guides into folders",
    "chore: bump next",
    "docs: explain the design tokens\n\nA longer body is fine.",
    "# a comment git strips\nci: check commit messages",
  ])("accepts %j", (message) => {
    expect(checkCommitMessage(message)).toBeNull();
  });

  it.each(["Merge pull request #7 from x/y", 'Revert "feat: x"', "fixup! feat: x"])(
    "leaves git's own %j alone",
    (message) => {
      expect(checkCommitMessage(message)).toBeNull();
    },
  );

  it.each([
    "Add the portfolio",
    "feature: add the portfolio",
    "feat:add the portfolio",
    "feat(CV): shout",
    "Feat: capitalised type",
    "",
  ])("rejects %j", (message) => {
    expect(checkCommitMessage(message)).not.toBeNull();
  });

  it("rejects a first line that runs long", () => {
    expect(checkCommitMessage(`feat: ${"x".repeat(MAX_HEADER_LENGTH)}`)).toMatch(/characters/);
  });
});
