import type { Metadata } from "next";
import type { CategorySummary } from "@/components/effects/CategoryCard";
import { EffectIndex } from "@/components/effects/EffectIndex";
import { EffectUploadButton } from "@/components/effects/EffectUploadButton";
import { CompactPageHeader } from "@/components/layout/CompactPageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { entriesOf, treeOf, type EffectCategoryBundle, type EffectEntry } from "@/lib/effects/effect-model";
import { getEffectCategories } from "@/lib/effects/effects";
import { routes } from "@/lib/routes/routes";

export const metadata: Metadata = {
  title: "Effects library",
  description:
    "Transitions, sound effects, overlays, icons and animated elements for video editing, sorted by category with a preview for every file.",
  alternates: { canonical: `${routes.effects}/` },
};

/** One file with a still from each pack in turn, so the strip shows variety. */
function samplesOf(category: EffectCategoryBundle, count = 4): EffectEntry[] {
  const withStill = category.packs.map((pack) =>
    entriesOf([pack]).filter((entry) => entry.kind === "video" || entry.kind === "image"),
  );
  const samples: EffectEntry[] = [];

  for (let round = 0; samples.length < count; round += 1) {
    const picked = withStill.map((list) => list[round]).filter(Boolean);
    if (picked.length === 0) break;
    samples.push(...picked.slice(0, count - samples.length));
  }

  return samples;
}

export default function EffectsPage() {
  const categories = getEffectCategories();

  const summaries: CategorySummary[] = categories.map((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    description: category.description,
    total: category.total,
    packCount: category.packs.length,
    counts: category.counts,
    samples: samplesOf(category),
  }));

  const entries = entriesOf(categories.flatMap((category) => category.packs));

  return (
    // A reference tool, not a landing page: a line of heading and straight
    // into the search.
    <PageContainer>
      <CompactPageHeader
        title="Effects library"
        description="Video-editing effects by category. Previews play from Google Drive."
        action={<EffectUploadButton />}
      />
      <EffectIndex categories={summaries} entries={entries} tree={treeOf(categories)} />
    </PageContainer>
  );
}
