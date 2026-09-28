import type { Metadata } from "next";
import { DocIndex } from "@/components/docs/DocIndex";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/layout/PageIntro";
import { site } from "@/lib/apps/apps";
import { LANGUAGES, type Doc, type Lang } from "@/lib/docs/doc-model";
import { getDocBundles } from "@/lib/docs/docs";
import { routes } from "@/lib/routes/routes";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Setup and reference guides in English and Vietnamese — pick a guide, or jump straight to the section you need.",
  alternates: { canonical: `${routes.docs}/` },
};

export default function DocsPage() {
  const bundles = getDocBundles();

  const versions = Object.fromEntries(
    LANGUAGES.map((lang) => [lang, bundles.map((bundle) => bundle.versions[lang])]),
  ) as Record<Lang, Doc[]>;

  return (
    <PageContainer>
      <PageIntro eyebrow={site.publisher} title="Guides">
        Setup notes written down once, in English and Vietnamese, so the next
        machine takes an afternoon instead of a week. Every section is linked
        directly, so you can start wherever you are stuck.
      </PageIntro>

      <DocIndex versions={versions} />
    </PageContainer>
  );
}
