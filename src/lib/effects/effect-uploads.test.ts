import { describe, expect, it } from "vitest";
import {
  UPLOADS_PACK_SLUG,
  addToManifest,
  emptyManifest,
  kindOfFile,
  parseManifest,
  treeWithUploads,
  uploadedEntries,
  type UploadedItem,
} from "./effect-uploads";

function item(id: string, overrides: Partial<UploadedItem> = {}): UploadedItem {
  return {
    id,
    file: `${id}.mp4`,
    kind: "video",
    category: "transitions",
    uploadedAt: "2026-09-26T10:00:00.000Z",
    ...overrides,
  };
}

describe("parseManifest", () => {
  it("reads a well-formed manifest", () => {
    const manifest = { version: 1, items: [item("1aaaaaaaaaaaa")] };
    expect(parseManifest(manifest)).toEqual(manifest);
  });

  it("treats anything that is not a manifest as empty", () => {
    expect(parseManifest(null)).toEqual(emptyManifest());
    expect(parseManifest("nope")).toEqual(emptyManifest());
    expect(parseManifest({ items: "nope" })).toEqual(emptyManifest());
  });

  it("drops entries it cannot show, keeping the rest", () => {
    const parsed = parseManifest({
      items: [
        item("1aaaaaaaaaaaa"),
        item("bad id!"),
        item("1bbbbbbbbbbbb", { kind: "archive" as never }),
        item("1cccccccccccc", { category: "no-such-category" }),
        item("1dddddddddddd", { file: "  " }),
      ],
    });

    expect(parsed.items.map((entry) => entry.id)).toEqual(["1aaaaaaaaaaaa"]);
  });
});

describe("kindOfFile", () => {
  it("goes by the mime type", () => {
    expect(kindOfFile("a.mov", "video/quicktime")).toBe("video");
    expect(kindOfFile("a.wav", "audio/wav")).toBe("audio");
    expect(kindOfFile("a.gif", "image/gif")).toBe("image");
    expect(kindOfFile("a.otf", "font/otf")).toBe("font");
  });

  it("recognises a font by its extension when the browser gives no type", () => {
    expect(kindOfFile("Display.ttf", "")).toBe("font");
  });

  it("refuses what the library cannot show", () => {
    expect(kindOfFile("pack.zip", "application/zip")).toBeNull();
    expect(kindOfFile("notes.pdf", "application/pdf")).toBeNull();
  });
});

describe("addToManifest", () => {
  it("puts the newest first and replaces an id already listed", () => {
    const old = addToManifest(emptyManifest(), [
      item("1aaaaaaaaaaaa", { uploadedAt: "2026-01-01T00:00:00.000Z" }),
    ]);
    const next = addToManifest(old, [
      item("1bbbbbbbbbbbb", { uploadedAt: "2026-02-01T00:00:00.000Z" }),
      item("1aaaaaaaaaaaa", { file: "renamed.mp4", uploadedAt: "2026-01-15T00:00:00.000Z" }),
    ]);

    expect(next.items.map((entry) => [entry.id, entry.file])).toEqual([
      ["1bbbbbbbbbbbb", "1bbbbbbbbbbbb.mp4"],
      ["1aaaaaaaaaaaa", "renamed.mp4"],
    ]);
  });
});

describe("treeWithUploads", () => {
  const tree = [
    { id: "transitions", label: "Transitions", icon: "✨", total: 10, packs: [{ slug: "film-burn", name: "Film Burn", count: 10 }] },
    { id: "sound", label: "Sound", icon: "🔊", total: 5, packs: [{ slug: "sfx", name: "SFX", count: 5 }] },
  ];

  it("adds an uploads pack, first, to the categories that have uploads", () => {
    const manifest = addToManifest(emptyManifest(), [item("1aaaaaaaaaaaa"), item("1bbbbbbbbbbbb")]);
    const [transitions, sound] = treeWithUploads(tree, manifest);

    expect(transitions.total).toBe(12);
    expect(transitions.packs.map((pack) => [pack.slug, pack.count])).toEqual([
      [UPLOADS_PACK_SLUG, 2],
      ["film-burn", 10],
    ]);
    expect(sound).toBe(tree[1]);
  });

  it("leaves the tree alone with no uploads", () => {
    expect(treeWithUploads(tree, null)).toBe(tree);
  });
});

describe("uploadedEntries", () => {
  const manifest = addToManifest(emptyManifest(), [
    item("1aaaaaaaaaaaa"),
    item("1bbbbbbbbbbbb", { category: "sound", kind: "audio" }),
  ]);

  it("files uploads under one pack of their category", () => {
    const entries = uploadedEntries(manifest, "sound");

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ id: "1bbbbbbbbbbbb", packSlug: UPLOADS_PACK_SLUG, category: "sound" });
  });

  it("returns every upload when no category is given, and none before loading", () => {
    expect(uploadedEntries(manifest)).toHaveLength(2);
    expect(uploadedEntries(null)).toEqual([]);
  });
});
