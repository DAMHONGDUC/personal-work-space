/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { parsePosition, readStoredPosition, writePosition } from "@/lib/docs/reading-position";

beforeEach(() => window.localStorage.clear());

describe("reading position", () => {
  it("round-trips through storage, one entry per guide", () => {
    writePosition("ssh-git", { section: "agent", offset: 240, done: false });

    expect(parsePosition(readStoredPosition("ssh-git"))).toEqual({ section: "agent", offset: 240, done: false });
    expect(readStoredPosition("xcode-setup")).toBeNull();
  });

  it("reads anything malformed as nothing saved", () => {
    expect(parsePosition("not json")).toBeNull();
    expect(parsePosition('{"offset":3}')).toBeNull();
    expect(parsePosition(null)).toBeNull();
  });

  it("never stores a negative offset", () => {
    expect(parsePosition('{"section":"a","offset":-50}')).toEqual({ section: "a", offset: 0, done: false });
  });
});
