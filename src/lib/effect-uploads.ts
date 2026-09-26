/**
 * Files uploaded from the site, and the JSON on Drive that lists them.
 *
 * The synced library is baked into the build; uploads are not. They are
 * listed in a manifest file on Drive, beside the upload folder, which the site
 * reads when a page opens and rewrites after each upload — so a new file shows
 * up without a rebuild. Plain functions only: the Drive calls live in
 * `google-drive.ts`, and this stays testable without a browser.
 */
import library from "@/data/effect-library.json";
import {
  EFFECT_KINDS,
  type EffectEntry,
  type EffectKind,
  type EffectLibrary,
  type EffectTreeCategory,
} from "@/lib/effect-model";

const { driveFolderId, uploads, categories } = library as EffectLibrary;

export const UPLOADS_ROOT_ID = driveFolderId;
export const UPLOADS_FOLDER_NAME = uploads.folderName;
export const UPLOADS_MANIFEST_NAME = uploads.manifestName;

/** How uploads appear in a category: one pack, above the synced ones. */
export const UPLOADS_PACK_SLUG = "my-uploads";
export const UPLOADS_PACK_NAME = "My uploads";

export type UploadedItem = {
  id: string;
  file: string;
  kind: EffectKind;
  category: string;
  /** ISO timestamp; the newest upload is listed first. */
  uploadedAt: string;
};

export type UploadsManifest = { version: 1; items: UploadedItem[] };

export function emptyManifest(): UploadsManifest {
  return { version: 1, items: [] };
}

const DRIVE_ID = /^[A-Za-z0-9_-]{10,}$/;
const FONT_EXTENSIONS = /\.(otf|ttf|woff2?)$/i;
const knownCategories = new Set(categories.map((category) => category.id));

/**
 * The manifest as read from Drive, with anything unusable dropped rather than
 * thrown on: one bad entry, or a category since renamed, should not take the
 * rest of the uploads off the page.
 */
export function parseManifest(raw: unknown): UploadsManifest {
  const items = (raw as { items?: unknown })?.items;
  if (!Array.isArray(items)) return emptyManifest();

  return {
    version: 1,
    items: items.filter((item): item is UploadedItem => {
      const candidate = item as Partial<UploadedItem>;
      return (
        typeof candidate?.id === "string" &&
        DRIVE_ID.test(candidate.id) &&
        typeof candidate.file === "string" &&
        candidate.file.trim() !== "" &&
        EFFECT_KINDS.includes(candidate.kind as EffectKind) &&
        knownCategories.has(candidate.category ?? "") &&
        typeof candidate.uploadedAt === "string"
      );
    }),
  };
}

/** The kind a file is shown as, or null when the library cannot show it. */
export function kindOfFile(name: string, mime: string): EffectKind | null {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("font") || FONT_EXTENSIONS.test(name)) return "font";
  return null;
}

/** New uploads added, newest first; an id already listed is replaced. */
export function addToManifest(manifest: UploadsManifest, added: UploadedItem[]): UploadsManifest {
  const ids = new Set(added.map((item) => item.id));

  return {
    version: 1,
    items: [...added, ...manifest.items.filter((item) => !ids.has(item.id))].sort((a, b) =>
      b.uploadedAt.localeCompare(a.uploadedAt),
    ),
  };
}

/** The categories an upload can be filed under, in the library's order. */
export const UPLOAD_CATEGORIES = categories.map(({ id, label }) => ({ id, label }));

/** The navigation tree with each category's uploads added as a pack of its own. */
export function treeWithUploads(
  tree: EffectTreeCategory[],
  manifest: UploadsManifest | null,
): EffectTreeCategory[] {
  if (!manifest?.items.length) return tree;

  return tree.map((category) => {
    const count = manifest.items.filter((item) => item.category === category.id).length;
    if (count === 0) return category;

    return {
      ...category,
      total: category.total + count,
      packs: [{ slug: UPLOADS_PACK_SLUG, name: UPLOADS_PACK_NAME, count }, ...category.packs],
    };
  });
}

/** Uploads as library entries, for one category or for all of them. */
export function uploadedEntries(manifest: UploadsManifest | null, category?: string): EffectEntry[] {
  return (manifest?.items ?? [])
    .filter((item) => category === undefined || item.category === category)
    .map((item) => ({
      id: item.id,
      file: item.file,
      kind: item.kind,
      pack: UPLOADS_PACK_NAME,
      packSlug: UPLOADS_PACK_SLUG,
      category: item.category,
    }));
}
