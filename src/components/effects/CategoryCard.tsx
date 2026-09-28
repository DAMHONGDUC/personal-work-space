import Link from "next/link";
import {
  EFFECT_KINDS,
  EFFECT_KIND_LABELS,
  thumbnailUrl,
  type EffectCategory,
  type EffectEntry,
  type EffectKind,
} from "@/lib/effects/effect-model";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** What the index needs to know about a category, without shipping its files. */
export type CategorySummary = EffectCategory & {
  total: number;
  packCount: number;
  counts: Record<EffectKind, number>;
  /** A few files with a still, to show what is inside before opening it. */
  samples: EffectEntry[];
};

export function CategoryCard({ category }: { category: CategorySummary }) {
  const kinds = EFFECT_KINDS.filter((kind) => category.counts[kind] > 0)
    .map((kind) => `${category.counts[kind]} ${EFFECT_KIND_LABELS[kind].toLowerCase()}`)
    .join(" · ");

  return (
    <Link
      href={routes.effectCategory(category.id)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-foreground/25"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to bottom,
            ${AppColors.tint(AppColors.EFFECTS, 14)} 0%,
            ${AppColors.tint(AppColors.EFFECTS, 6)} 45%,
            transparent 100%)`,
        }}
      />

      <span className="relative flex items-start justify-between gap-4">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border text-xl"
          style={{
            backgroundColor: `${AppColors.tint(AppColors.EFFECTS, 14)}`,
            borderColor: `${AppColors.tint(AppColors.EFFECTS, 28)}`,
          }}
        >
          {category.icon}
        </span>
        <span className="mt-1 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">
          →
        </span>
      </span>

      <span className="relative mt-4 block font-semibold tracking-tight">{category.label}</span>
      <span className={`${AppTextStyles.BODY_SM} relative mt-1.5 block`}>
        {category.description}
      </span>

      {category.samples.length > 0 && (
        <span aria-hidden className="relative mt-5 grid grid-cols-4 gap-1.5">
          {category.samples.map((sample) => (
            <span
              key={sample.id}
              className="checkerboard aspect-square overflow-hidden rounded-lg border border-border-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- see EffectTile */}
              <img
                src={thumbnailUrl(sample.id, 200)}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`size-full ${sample.kind === "video" ? "object-cover" : "object-contain p-1"}`}
              />
            </span>
          ))}
        </span>
      )}

      <span className={`${AppTextStyles.CAPTION} relative mt-auto block pt-5`}>
        {category.total} files in {category.packCount}{" "}
        {category.packCount === 1 ? "pack" : "packs"}
        <span className="block pt-0.5">{kinds}</span>
      </span>
    </Link>
  );
}
