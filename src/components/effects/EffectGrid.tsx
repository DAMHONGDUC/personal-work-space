import { EffectTile } from "@/components/effects/EffectTile";
import type { EffectEntry } from "@/lib/effect-model";

/**
 * A grid of tiles. It holds no dialog of its own: the page owns one preview
 * for everything on screen, so next and previous run across the grids.
 */
export function EffectGrid({
  entries,
  onOpen,
  showPack,
}: {
  entries: EffectEntry[];
  onOpen: (entry: EffectEntry) => void;
  showPack?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <EffectTile entry={entry} onOpen={() => onOpen(entry)} showPack={showPack} />
        </li>
      ))}
    </ul>
  );
}
