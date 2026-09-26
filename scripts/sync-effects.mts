/**
 * Rebuilds the file lists in src/data/effects from the shared Google Drive
 * folder named in effect-library.json.
 *
 * Each top-level folder of the Drive is a pack, and gets one JSON file. The
 * pack's files are read from Drive's embedded folder view, which answers a
 * public folder without a login or an API key and lists it in one response.
 *
 * Only the file list is Drive's. The pack's `name`, `category` and `exclude`
 * are written by hand and kept across syncs, matched by folder id, so a
 * folder renamed on Drive keeps its slug here — or by folder name when the id
 * is unknown, so pointing the library at a copy of the Drive keeps them too. A
 * folder new to Drive is written with an empty category, which fails the data
 * tests until someone files it.
 *
 * Kept: video, audio, images and fonts. Dropped: archives, project files,
 * PDFs, and anything under `__MACOSX`, which is macOS zip debris.
 *
 * Run by hand — `npm run effects:sync` — and commit the result. The build
 * never talks to Drive.
 */
import fs from "node:fs";
import path from "node:path";
import { ResourceConstant } from "../src/lib/resource-constant.mts";

type Kind = "video" | "audio" | "image" | "font";
type Item = { id: string; file: string; kind: Kind; group?: string };
type Pack = {
  name: string;
  category: string;
  folderId: string;
  exclude?: string[];
  items: Item[];
};
type Entry = { id: string; name: string; folder: boolean; mime: string };

const root = path.join(import.meta.dirname, "..");
const packsDir = path.join(root, ResourceConstant.EFFECTS_DIR);
const library = JSON.parse(
  fs.readFileSync(path.join(root, ResourceConstant.EFFECT_LIBRARY_FILE), "utf8"),
) as { driveFolderId: string; uploads: { folderName: string } };

const SKIPPED_FOLDERS = new Set(["__MACOSX"]);
const PARALLEL_REQUESTS = 6;

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function kindOf(mime: string): Kind | null {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("font")) return "font";
  return null;
}

// Drive answers a burst of requests with the odd 429, so they are queued.
let active = 0;
const waiting: (() => void)[] = [];

async function throttled<T>(task: () => Promise<T>): Promise<T> {
  if (active >= PARALLEL_REQUESTS) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  active += 1;
  try {
    return await task();
  } finally {
    active -= 1;
    waiting.shift()?.();
  }
}

async function fetchListing(folderId: string): Promise<string> {
  const url = `https://drive.google.com/embeddedfolderview?id=${folderId}`;

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) return response.text();

    if (attempt === 4) {
      throw new Error(`${url} answered ${response.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
}

/** One folder's direct children, parsed out of the embedded view's markup. */
async function listFolder(folderId: string): Promise<Entry[]> {
  const html = await throttled(() => fetchListing(folderId));

  return html
    .split('<div class="flip-entry" ')
    .slice(1)
    .map((chunk) => {
      const entryId = /id="entry-([^"]+)"/.exec(chunk)?.[1];
      const name = /class="flip-entry-title">([^<]*)</.exec(chunk)?.[1];
      if (!entryId || name === undefined) {
        throw new Error(`Unreadable entry in folder ${folderId}`);
      }

      // A Drive shortcut has an id of its own, which the embedded view cannot
      // open; its link points at the real folder or file, so that id is used.
      const target = /href="[^"]*\/(?:folders|file\/d)\/([A-Za-z0-9_-]+)/.exec(chunk)?.[1];

      return {
        id: target ?? entryId,
        name: decodeEntities(name).trim(),
        folder: /href="[^"]*\/drive\/folders\//.test(chunk),
        mime: /\/type\/([^"]+)"/.exec(chunk)?.[1] ?? "",
      };
    });
}

/** Every kept file under a folder, with the sub-folders it sits in. */
async function collect(
  folderId: string,
  trail: string[],
  exclude: string[],
): Promise<Item[]> {
  const entries = await listFolder(folderId);
  const nested: Promise<Item[]>[] = [];
  const items: Item[] = [];

  for (const entry of entries) {
    if (entry.folder) {
      const next = [...trail, entry.name];
      if (SKIPPED_FOLDERS.has(entry.name)) continue;
      if (exclude.some((prefix) => next.join("/").startsWith(prefix))) continue;
      nested.push(collect(entry.id, next, exclude));
      continue;
    }

    const kind = kindOf(entry.mime);
    if (!kind) continue;

    items.push({
      id: entry.id,
      file: entry.name,
      kind,
      ...(trail.length > 0 && { group: trail.join(" / ") }),
    });
  }

  return [...items, ...(await Promise.all(nested)).flat()];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortItems(items: Item[]): Item[] {
  return items.sort(
    (a, b) =>
      byName.compare(a.group ?? "", b.group ?? "") || byName.compare(a.file, b.file),
  );
}

type Known = { slug: string; pack: Pack };

function readPacks(): Known[] {
  if (!fs.existsSync(packsDir)) return [];

  return fs
    .readdirSync(packsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      slug: path.basename(file, ".json"),
      pack: JSON.parse(fs.readFileSync(path.join(packsDir, file), "utf8")) as Pack,
    }));
}

const existing = readPacks();
const byFolderId = new Map(existing.map((known) => [known.pack.folderId, known]));
const bySlug = new Map(existing.map((known) => [known.slug, known]));

/**
 * The pack a Drive folder already has a file for: by folder id, or — when the
 * library has moved to a copy of the Drive, where every id is new — by the
 * slug its folder name gives, so the hand-edited fields carry over.
 */
function knownPack(folder: Entry): Known | undefined {
  return byFolderId.get(folder.id) ?? bySlug.get(slugify(folder.name));
}
// Uploads from the site are listed by their own JSON on Drive and read at
// runtime, so their folder is not a pack.
const folders = (await listFolder(library.driveFolderId)).filter(
  (entry) => entry.folder && entry.name !== library.uploads.folderName,
);

if (folders.length === 0) {
  // Every pack would count as gone. Far more likely the folder is not shared.
  throw new Error(
    `Drive folder ${library.driveFolderId} lists no folders — is it shared as "Anyone with the link"?`,
  );
}

fs.mkdirSync(packsDir, { recursive: true });

const results = await Promise.all(
  folders.map(async (folder) => {
    const known = knownPack(folder);
    const exclude = known?.pack.exclude ?? [];
    const items = sortItems(await collect(folder.id, [], exclude));

    const pack: Pack = {
      name: known?.pack.name ?? folder.name,
      category: known?.pack.category ?? "",
      folderId: folder.id,
      ...(exclude.length > 0 && { exclude }),
      items,
    };

    return { slug: known?.slug ?? slugify(folder.name), pack, isNew: !known };
  }),
);

for (const { slug, pack, isNew } of results) {
  if (pack.items.length === 0) {
    if (isNew) {
      // Nothing previewable, only archives or project files: no page to show.
      console.log(`skipped  "${pack.name}" — nothing previewable`);
    } else {
      // A pack that had files and now lists none is far likelier to be Drive
      // refusing the listing — sharing changed, a copy half made — than a
      // folder emptied on purpose. Its file is kept rather than wiped.
      console.warn(`kept     ${slug}.json — Drive listed nothing for it; left as it was`);
    }
    continue;
  }

  fs.writeFileSync(
    path.join(packsDir, `${slug}.json`),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  console.log(`${isNew ? "added   " : "updated "} ${slug}.json — ${pack.items.length} files`);
}

// A folder gone from Drive would leave a pack of dead links behind. Only a
// folder missing from the listing counts as gone; an empty one is kept above.
const onDrive = new Set(results.map(({ slug }) => slug));
for (const { slug } of existing) {
  if (onDrive.has(slug)) continue;
  fs.rmSync(path.join(packsDir, `${slug}.json`));
  console.log(`removed  ${slug}.json — no longer on Drive`);
}
