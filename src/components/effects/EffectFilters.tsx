"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FilterPlacement } from "@/components/effects/FilterPanel";
import { KindFilter } from "@/components/effects/KindFilter";
import { SearchInput } from "@/components/shared/SearchInput";
import type { EffectKind } from "@/lib/effects/effect-model";

/** The search box, the kind filter and the count, laid out for one placement. */
export function EffectFilters({
  placement,
  query,
  onQueryChange,
  kind,
  onKindChange,
  counts,
  summary,
  label,
  placeholder,
  backHref,
}: {
  placement: FilterPlacement;
  query: string;
  onQueryChange: (value: string) => void;
  kind: EffectKind | null;
  onKindChange: (next: EffectKind | null) => void;
  counts: Record<EffectKind, number>;
  /** "158 files", "7 of 1633 files" … */
  summary: string;
  label: string;
  placeholder: string;
  /**
   * One level up, for the phone bar: the tree that carries the way back on a
   * wide screen is not shown there.
   */
  backHref?: string;
}) {
  if (placement === "panel") {
    return (
      <>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          label={label}
          placeholder={placeholder}
          className="sm:max-w-none"
        />
        <KindFilter kind={kind} onChange={onKindChange} counts={counts} orientation="vertical" />
        <p className="px-1 text-xs text-muted">{summary}</p>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back to the effects library"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-surface text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <SearchInput
          value={query}
          onChange={onQueryChange}
          label={label}
          placeholder={placeholder}
          className="min-w-0 flex-1 sm:max-w-none [&_input]:h-9"
        />
      </div>
      <div className="flex items-center justify-between gap-3 overflow-x-auto">
        <KindFilter kind={kind} onChange={onKindChange} counts={counts} />
        <p className="shrink-0 text-xs text-muted">{summary}</p>
      </div>
    </div>
  );
}
