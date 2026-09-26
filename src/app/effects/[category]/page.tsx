import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryBrowser } from "@/components/effects/CategoryBrowser";
import { EffectUploadButton } from "@/components/effects/EffectUploadButton";
import { EFFECTS_ACCENT, treeOf } from "@/lib/effect-model";
import { getEffectCategories, getEffectCategory } from "@/lib/effects";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return getEffectCategories().map((category) => ({ category: category.id }));
}

export async function generateMetadata(
  props: PageProps<"/effects/[category]">,
): Promise<Metadata> {
  const { category: id } = await props.params;
  const category = getEffectCategory(id);

  if (!category) {
    return { title: "Not found" };
  }

  return {
    title: `${category.label} — Effects library`,
    description: category.description,
    alternates: { canonical: `${routes.effectCategory(category.id)}/` },
  };
}

export default async function EffectCategoryPage(props: PageProps<"/effects/[category]">) {
  const { category: id } = await props.params;
  const category = getEffectCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8">
      {/* Compact on purpose: the page is for looking things up, so the files
          start above the fold. Counts live in the filters and the pack list. */}
      <div className="flex items-center gap-3 pb-6">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border text-lg"
          style={{
            backgroundColor: `color-mix(in oklab, ${EFFECTS_ACCENT} 14%, transparent)`,
            borderColor: `color-mix(in oklab, ${EFFECTS_ACCENT} 28%, transparent)`,
          }}
        >
          {category.icon}
        </span>
        <div className="flex min-w-0 flex-col">
          <nav className="text-xs text-muted">
            <Link href={routes.effects} className="transition-colors hover:text-foreground">
              Effects library
            </Link>
            <span className="px-1.5 opacity-50">/</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight">{category.label}</h1>
        </div>
        <div className="ml-auto">
          <EffectUploadButton defaultCategory={category.id} />
        </div>
      </div>

      <CategoryBrowser
        category={category.id}
        packs={category.packs}
        tree={treeOf(getEffectCategories())}
      />
    </main>
  );
}
