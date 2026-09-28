import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBrowser } from "@/components/effects/CategoryBrowser";
import { CategoryIcon } from "@/components/effects/CategoryIcon";
import { EffectUploadButton } from "@/components/effects/EffectUploadButton";
import { BreadcrumbLink } from "@/components/layout/BreadcrumbLink";
import { CompactPageHeader } from "@/components/layout/CompactPageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { treeOf } from "@/lib/effects/effect-model";
import { getEffectCategories, getEffectCategory } from "@/lib/effects/effects";
import { routes } from "@/lib/routes/routes";

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
    // Compact on purpose: the page is for looking things up, so the files
    // start above the fold. Counts live in the filters and the pack list.
    <PageContainer>
      <CompactPageHeader
        title={category.label}
        leading={<CategoryIcon icon={category.icon} />}
        breadcrumb={<BreadcrumbLink href={routes.effects}>Effects library</BreadcrumbLink>}
        action={<EffectUploadButton defaultCategory={category.id} />}
      />

      <CategoryBrowser
        category={category.id}
        packs={category.packs}
        tree={treeOf(getEffectCategories())}
      />
    </PageContainer>
  );
}
