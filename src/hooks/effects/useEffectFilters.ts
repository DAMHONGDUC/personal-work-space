"use client";

import { useQueryChoice, useQueryText } from "@/hooks/routes/useQueryParam";
import { EFFECT_KINDS, type EffectKind } from "@/lib/effects/effect-model";
import { EFFECTS_QUERY } from "@/lib/routes/routes";

/**
 * The effects library's search and kind filter, kept in the address
 * (`?q=whoosh&kind=audio`) so a reload or a shared link opens on the same
 * files. The front page and every category read the same names.
 */
export function useEffectFilters(): {
  query: string;
  setQuery: (value: string) => void;
  kind: EffectKind | null;
  setKind: (value: EffectKind | null) => void;
} {
  const [query, setQuery] = useQueryText(EFFECTS_QUERY.search);
  const [kind, setKind] = useQueryChoice(EFFECTS_QUERY.kind, EFFECT_KINDS);

  return { query, setQuery, kind, setKind };
}
