/**
 * The shape of the effects library, and the Google Drive addresses its files
 * are shown from.
 *
 * Nothing is hosted here: every thumbnail, player and download is served by
 * Drive, from the public folder the packs were synced from. Kept apart from the
 * loader in `effects.ts` because the browsing pages are client components, and
 * anything touching `node:fs` cannot be imported there.
 */

export const EFFECT_KINDS = ["video", "audio", "image", "font"] as const;

export type EffectKind = (typeof EFFECT_KINDS)[number];

export const EFFECT_KIND_LABELS: Record<EffectKind, string> = {
  video: "Video",
  audio: "Audio",
  image: "Image",
  font: "Font",
};

/** One file, as Drive lists it. */
export type EffectItem = {
  /** Drive file id. */
  id: string;
  /** The filename on Drive, extension included. */
  file: string;
  kind: EffectKind;
  /** Sub-folders inside the pack, joined with " / ". Absent at the pack root. */
  group?: string;
};

/** The shape of one file in src/data/effects. */
export type EffectPackData = {
  name: string;
  /** An `id` from the categories in effect-library.json. */
  category: string;
  /** Drive id of the pack's top-level folder. */
  folderId: string;
  /**
   * Sub-folder paths inside the pack left out of the listing, such as a
   * Premiere template's own footage. Hand-edited; the sync honours it.
   */
  exclude?: string[];
  items: EffectItem[];
};

/** One pack. The slug comes from the filename. */
export type EffectPack = EffectPackData & { slug: string };

/** A file with the pack and category it belongs to, for a flat list or a search. */
export type EffectEntry = EffectItem & {
  pack: string;
  packSlug: string;
  category: string;
};

export function entriesOf(packs: EffectPack[]): EffectEntry[] {
  return packs.flatMap((pack) =>
    pack.items.map((item) => ({
      ...item,
      pack: pack.name,
      packSlug: pack.slug,
      category: pack.category,
    })),
  );
}

export type EffectCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

export type EffectLibrary = {
  driveFolderId: string;
  /**
   * Where files uploaded from the site go, inside `driveFolderId`, and the
   * JSON beside them that lists them. The sync leaves both alone: uploads are
   * read from that JSON at runtime, not baked into the build.
   */
  uploads: { folderName: string; manifestName: string };
  categories: EffectCategory[];
};

/**
 * A category with the packs filed under it, in the order they are shown, and
 * how many files of each kind they hold between them.
 */
export type EffectCategoryBundle = EffectCategory & {
  packs: EffectPack[];
  counts: Record<EffectKind, number>;
  total: number;
};

/**
 * What the navigation tree needs of a category: enough to list it and its
 * packs, without the files.
 */
export type EffectTreeCategory = {
  id: string;
  label: string;
  icon: string;
  total: number;
  packs: { slug: string; name: string; count: number }[];
};

export function treeOf(categories: EffectCategoryBundle[]): EffectTreeCategory[] {
  return categories.map((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    total: category.total,
    packs: category.packs.map((pack) => ({
      slug: pack.slug,
      name: pack.name,
      count: pack.items.length,
    })),
  }));
}

/** `boom-geomorphism_trailer-123876.mp3` -> `boom geomorphism trailer 123876`. */
export function displayName(file: string): string {
  return file
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The file extension, upper-cased for a badge: `MOV`, `MP3`. */
export function extensionOf(file: string): string {
  const match = /\.([a-z0-9]{2,5})$/i.exec(file);
  return match ? match[1].toUpperCase() : "";
}

/**
 * A resized still from Google's image CDN. Animated GIFs stay animated, and a
 * video gets its first frame. Audio and fonts have none.
 */
export function thumbnailUrl(id: string, width = 480): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

/** Drive's own player, for embedding in an iframe. */
export function previewUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function driveFileUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view`;
}

export function driveFolderUrl(id: string): string {
  return `https://drive.google.com/drive/folders/${id}`;
}

export function downloadUrl(id: string): string {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}
