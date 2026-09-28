import type { Metadata } from "next";
import { DocIndex } from "@/components/docs/DocIndex";
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
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="flex max-w-2xl flex-col gap-5 pb-10">
        <span className="w-fit rounded-full border border-border-soft px-3 py-1 text-xs text-muted">
          {site.publisher}
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Guides</h1>
        <p className="text-lg leading-8 text-muted">
          Setup notes written down once, in English and Vietnamese, so the next
          machine takes an afternoon instead of a week. Every section is linked
          directly, so you can start wherever you are stuck.
        </p>
      </div>

      <DocIndex versions={versions} />
    </main>
  );
}
