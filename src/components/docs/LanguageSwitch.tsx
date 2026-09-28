"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LANGUAGES, LANGUAGE_LABELS, type Lang } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

/**
 * Segmented control for the language a guide is read in. Both versions are
 * already on the page, so switching is a re-render — no navigation, and the
 * section you were reading stays under the cursor.
 *
 * Built on the Radix toggle group rather than two buttons: it gives the group a
 * single tab stop and moves between the options with the arrow keys, which is
 * what a segmented control is expected to do and is easy to get wrong by hand.
 */
export function LanguageSwitch({
  lang,
  onChange,
  accent,
}: {
  lang: Lang;
  onChange: (next: Lang) => void;
  accent: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={lang}
      // Radix reports "" when the pressed item is toggled off. A language is
      // always selected here, so that is a no-op rather than a third state.
      onValueChange={(next) => next && onChange(next as Lang)}
      variant="outline"
      aria-label="Language"
      className="rounded-xl border border-border-soft bg-surface p-1"
    >
      {LANGUAGES.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          title={LANGUAGE_LABELS[option]}
          className="border-0 px-3 text-sm font-medium uppercase data-[state=off]:text-muted"
          style={
            option === lang
              ? {
                  backgroundColor: `${AppColors.tint(accent, 16)}`,
                  color: accent,
                }
              : undefined
          }
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
