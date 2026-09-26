"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  EFFECT_KINDS,
  EFFECT_KIND_LABELS,
  EFFECTS_ACCENT,
  type EffectKind,
} from "@/lib/effect-model";

const ALL = "all";

/**
 * Narrows a list to one kind of file. Only the kinds present are offered, so a
 * category of sounds does not show a Video option that would empty the page.
 *
 * Horizontal above the results; vertical, with a count per kind, in the side
 * panel it moves to once the page scrolls.
 */
export function KindFilter({
  kind,
  onChange,
  counts,
  orientation = "horizontal",
}: {
  kind: EffectKind | null;
  onChange: (next: EffectKind | null) => void;
  counts: Record<EffectKind, number>;
  orientation?: "horizontal" | "vertical";
}) {
  const present = EFFECT_KINDS.filter((option) => counts[option] > 0);
  if (present.length < 2) return null;

  const vertical = orientation === "vertical";
  const value = kind ?? ALL;
  const total = present.reduce((sum, option) => sum + counts[option], 0);
  const options = [ALL, ...present];

  return (
    <ToggleGroup
      type="single"
      value={value}
      // Radix reports "" when the pressed item is toggled off; that means "all".
      onValueChange={(next) => onChange(!next || next === ALL ? null : (next as EffectKind))}
      variant="outline"
      orientation={orientation}
      aria-label="Kind of file"
      className={`rounded-xl border border-border-soft bg-surface p-1 ${
        vertical ? "w-full" : "shrink-0"
      }`}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className={`border-0 px-3 text-sm font-medium data-[state=off]:text-muted ${
            vertical ? "h-7 w-full justify-between" : ""
          }`}
          style={
            option === value
              ? {
                  backgroundColor: `color-mix(in oklab, ${EFFECTS_ACCENT} 16%, transparent)`,
                  color: EFFECTS_ACCENT,
                }
              : undefined
          }
        >
          {option === ALL ? "All" : EFFECT_KIND_LABELS[option as EffectKind]}
          {vertical && (
            <span className="text-xs font-normal tabular-nums opacity-70">
              {option === ALL ? total : counts[option as EffectKind]}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
