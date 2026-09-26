import { describe, expect, it } from "vitest";
import type { EffectEntry } from "@/lib/effect-model";
import { searchEffects } from "./effect-search";

function entry(file: string, overrides: Partial<EffectEntry> = {}): EffectEntry {
  return {
    id: file,
    file,
    kind: "audio",
    pack: "Sound Effects",
    packSlug: "sound-effects",
    category: "sound",
    ...overrides,
  };
}

const entries = [
  entry("cash-register-purchase-87313.mp3"),
  entry("Cash Register (Kaching).mp3"),
  entry("camera-shutter-6305.mp3"),
  entry("BURN_04.mov", { kind: "video", pack: "Film Burn", group: "BURN" }),
  entry("Hiệu ứng chuyển cảnh.mp4", { kind: "video" }),
];

describe("searchEffects", () => {
  it("returns everything for an empty query", () => {
    expect(searchEffects(entries, "  ")).toEqual(entries);
  });

  it("matches the filename with its dashes read as spaces", () => {
    expect(searchEffects(entries, "cash register").map((e) => e.file)).toEqual([
      "cash-register-purchase-87313.mp3",
      "Cash Register (Kaching).mp3",
    ]);
  });

  it("ANDs the terms rather than ORing them", () => {
    expect(searchEffects(entries, "cash kaching")).toHaveLength(1);
  });

  it("matches the pack and the sub-folder a file sits in", () => {
    expect(searchEffects(entries, "film burn").map((e) => e.file)).toEqual(["BURN_04.mov"]);
  });

  it("ignores Vietnamese diacritics on both sides", () => {
    expect(searchEffects(entries, "hieu ung").map((e) => e.file)).toEqual([
      "Hiệu ứng chuyển cảnh.mp4",
    ]);
  });

  it("narrows to one kind", () => {
    expect(searchEffects(entries, "", "video")).toHaveLength(2);
    expect(searchEffects(entries, "burn", "audio")).toEqual([]);
  });
});
