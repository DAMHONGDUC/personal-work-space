/**
 * Reads the effects library off disk. Server-only: the shape it returns lives
 * in `effect-model.ts`, which the browser may import.
 */
import fs from "node:fs";
import path from "node:path";
import library from "@/data/effect-library.json";
import {
  EFFECT_KINDS,
  type EffectCategoryBundle,
  type EffectKind,
  type EffectLibrary,
  type EffectPack,
  type EffectPackData,
} from "@/lib/effect-model";
import { ResourceConstant } from "@/lib/resource-constant.mts";

export const effectLibrary = library as EffectLibrary;

const packsDir = path.join(process.cwd(), ResourceConstant.EFFECTS_DIR);

/**
 * Every pack in src/data/effects, by name. Read fresh on each call, like the
 * other loaders: this only runs at build time.
 */
export function getEffectPacks(): EffectPack[] {
  return fs
    .readdirSync(packsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(packsDir, file), "utf8");

      try {
        return { slug: path.basename(file, ".json"), ...(JSON.parse(raw) as EffectPackData) };
      } catch (error) {
        throw new Error(
          `${ResourceConstant.EFFECTS_DIR}/${file} is not valid JSON: ${(error as Error).message}`,
        );
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
}

/**
 * The categories in the order effect-library.json lists them, each holding its
 * packs. A pack filed under a category that does not exist is an error, not a
 * pack left out: the data tests say so too, but the build should not quietly
 * drop a pack if they are skipped.
 */
export function getEffectCategories(): EffectCategoryBundle[] {
  const packs = getEffectPacks();
  const known = new Set(effectLibrary.categories.map((category) => category.id));

  for (const pack of packs) {
    if (!known.has(pack.category)) {
      throw new Error(
        `${ResourceConstant.EFFECTS_DIR}/${pack.slug}.json is filed under "${pack.category}", which is not a category in ${ResourceConstant.EFFECT_LIBRARY_FILE}`,
      );
    }
  }

  return effectLibrary.categories.map((category) => {
    const own = packs.filter((pack) => pack.category === category.id);
    const counts = Object.fromEntries(EFFECT_KINDS.map((kind) => [kind, 0])) as Record<
      EffectKind,
      number
    >;

    for (const item of own.flatMap((pack) => pack.items)) {
      counts[item.kind] += 1;
    }

    return {
      ...category,
      packs: own,
      counts,
      total: own.reduce((sum, pack) => sum + pack.items.length, 0),
    };
  });
}

export function getEffectCategory(id: string): EffectCategoryBundle | undefined {
  return getEffectCategories().find((category) => category.id === id);
}
