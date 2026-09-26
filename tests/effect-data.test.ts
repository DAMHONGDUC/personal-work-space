import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EFFECT_KINDS } from "@/lib/effect-model";
import { effectLibrary, getEffectCategories, getEffectPacks } from "@/lib/effects";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const packsDir = path.join(process.cwd(), ResourceConstant.EFFECTS_DIR);

const ALLOWED_PACK_KEYS = new Set(["name", "category", "folderId", "exclude", "items"]);
const ALLOWED_ITEM_KEYS = new Set(["id", "file", "kind", "group"]);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Drive ids are URL-safe base64; anything else would break the thumbnail URL.
const DRIVE_ID = /^[A-Za-z0-9_-]{20,}$/;

const packs = getEffectPacks();
const categoryIds = effectLibrary.categories.map((category) => category.id);

describe("effect-library.json", () => {
  it("names a Drive folder to sync from", () => {
    expect(effectLibrary.driveFolderId).toMatch(DRIVE_ID);
  });

  it("has unique, url-safe category ids", () => {
    expect(new Set(categoryIds).size).toBe(categoryIds.length);
    for (const id of categoryIds) expect(id).toMatch(SLUG);
  });

  it("gives every category a label, icon and description", () => {
    for (const category of effectLibrary.categories) {
      expect(category.label.trim()).not.toBe("");
      expect(category.icon.trim()).not.toBe("");
      expect(category.description.trim()).not.toBe("");
    }
  });

  it("has no empty category", () => {
    // A category with no pack is a card that opens onto nothing.
    for (const category of getEffectCategories()) {
      expect(category.packs.length, `${category.id} has no pack`).toBeGreaterThan(0);
    }
  });
});

describe("effect packs", () => {
  it("contains only .json files", () => {
    expect(fs.readdirSync(packsDir).filter((file) => !file.endsWith(".json"))).toEqual([]);
  });

  it("never lists the same Drive file twice", () => {
    // A file id is the key of a tile and of the preview's position.
    const ids = packs.flatMap((pack) => pack.items.map((item) => item.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never syncs the same Drive folder into two packs", () => {
    const folders = packs.map((pack) => pack.folderId);
    expect(new Set(folders).size).toBe(folders.length);
  });
});

describe.each(packs.map((pack) => [pack.slug, pack] as const))("%s", (slug, pack) => {
  it("uses only known fields", () => {
    const unknown = Object.keys(pack).filter((key) => key !== "slug" && !ALLOWED_PACK_KEYS.has(key));
    expect(unknown).toEqual([]);
  });

  it("has a url-safe slug, used as its anchor", () => {
    expect(slug).toMatch(SLUG);
  });

  it("is filed under a category that exists", () => {
    // The sync writes a new Drive folder with an empty category on purpose, so
    // it fails here until someone decides where it belongs.
    expect(categoryIds, `set "category" in ${slug}.json`).toContain(pack.category);
  });

  it("has a name and a Drive folder", () => {
    expect(pack.name.trim()).not.toBe("");
    expect(pack.folderId).toMatch(DRIVE_ID);
  });

  it("lists at least one file, each with a Drive id and a known kind", () => {
    expect(pack.items.length).toBeGreaterThan(0);

    for (const item of pack.items) {
      expect(Object.keys(item).filter((key) => !ALLOWED_ITEM_KEYS.has(key))).toEqual([]);
      expect(item.id).toMatch(DRIVE_ID);
      expect(item.file.trim()).not.toBe("");
      expect(EFFECT_KINDS).toContain(item.kind);
      if (item.group !== undefined) expect(item.group.trim()).not.toBe("");
    }
  });
});
