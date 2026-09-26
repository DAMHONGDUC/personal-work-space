/**
 * Searching the effects library, in the browser, over what the page already
 * shipped — the same approach as the guide search, and the same normalising,
 * so a query typed without Vietnamese diacritics still matches.
 */
import { displayName, type EffectEntry, type EffectKind } from "@/lib/effect-model";
import { normalize } from "@/lib/doc-search";

const textCache = new WeakMap<EffectEntry, string>();

/** The filename as a reader would say it, plus where it is filed. */
function entryText(entry: EffectEntry): string {
  const cached = textCache.get(entry);
  if (cached !== undefined) return cached;

  const text = normalize(
    [displayName(entry.file), entry.file, entry.pack, entry.group ?? "", entry.kind].join(" "),
  );
  textCache.set(entry, text);

  return text;
}

/**
 * The entries matching every term of `query`, in the order given, narrowed to
 * one kind when `kind` is set. Terms are ANDed: "cash register" finds the files
 * with both words, not every file with either.
 */
export function searchEffects(
  entries: EffectEntry[],
  query: string,
  kind?: EffectKind,
): EffectEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  return entries.filter((entry) => {
    if (kind && entry.kind !== kind) return false;
    if (terms.length === 0) return true;

    const text = entryText(entry);
    return terms.every((term) => text.includes(term));
  });
}
