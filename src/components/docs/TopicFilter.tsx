"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DOC_TOPICS,
  TOPIC_LABELS,
  type DocTopic,
  type Lang,
} from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

const ALL = "all";

/**
 * Narrows the guide index to the shelves picked; several can be on at once, and
 * none — or pressing All — shows every guide. Only topics that hold a guide are
 * offered, in `DOC_TOPICS` order, each with its count; the counts are of every
 * guide rather than of the search results, so the chips stay put while typing.
 *
 * Built on the Radix toggle group like `KindFilter`: one tab stop, arrow keys
 * between the options. The chips wrap, because nine topics do not fit a phone.
 */
export function TopicFilter({
  topics,
  onChange,
  counts,
  lang,
}: {
  topics: DocTopic[];
  onChange: (next: DocTopic[]) => void;
  counts: Record<DocTopic, number>;
  lang: Lang;
}) {
  const present = DOC_TOPICS.filter((option) => counts[option] > 0);
  if (present.length < 2) return null;

  const value = topics.length === 0 ? [ALL] : topics;
  const total = present.reduce((sum, option) => sum + counts[option], 0);
  const options = [ALL, ...present];

  return (
    <ToggleGroup
      type="multiple"
      value={value}
      // Pressing All clears the rest; pressing a topic while All is on replaces
      // it. Radix hands back the whole new set, so the newcomer is worked out.
      onValueChange={(next) =>
        onChange(
          next.includes(ALL) && !value.includes(ALL)
            ? []
            : (next.filter((option) => option !== ALL) as DocTopic[]),
        )
      }
      variant="outline"
      aria-label="Topic"
      className="w-full flex-wrap"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          lang={option === ALL ? undefined : lang}
          className="h-8 gap-1.5 rounded-full border-border-soft px-3 text-sm font-medium data-[state=off]:text-muted"
          style={
            value.includes(option)
              ? {
                  backgroundColor: `${AppColors.tint(AppColors.DOCS, 16)}`,
                  borderColor: `${AppColors.tint(AppColors.DOCS, 40)}`,
                  color: AppColors.DOCS,
                }
              : undefined
          }
        >
          {option === ALL ? "All" : TOPIC_LABELS[option as DocTopic][lang]}
          <span className="text-xs font-normal tabular-nums opacity-70">
            {option === ALL ? total : counts[option as DocTopic]}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
