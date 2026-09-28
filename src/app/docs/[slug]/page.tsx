import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/DocArticle";
import { getDocBundle, getDocBundles } from "@/lib/docs/docs";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes/routes";

export function generateStaticParams() {
  return getDocBundles().map((bundle) => ({ slug: bundle.slug }));
}

export async function generateMetadata(
  props: PageProps<"/docs/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const bundle = getDocBundle(slug);

  if (!bundle) {
    return { title: "Not found" };
  }

  // The page carries both languages and picks one in the browser, so there is
  // one URL to index — described in English, like the rest of the site.
  const doc = bundle.versions.en;
  const description = `${doc.tagline} Last updated ${formatDate(doc.lastUpdated)}.`;

  return {
    title: doc.title,
    description,
    alternates: { canonical: `${routes.doc(bundle.slug)}/` },
    openGraph: { title: doc.title, description, type: "article" },
  };
}

export default async function DocPage(props: PageProps<"/docs/[slug]">) {
  const { slug } = await props.params;
  const bundle = getDocBundle(slug);

  if (!bundle) {
    notFound();
  }

  return <DocArticle versions={bundle.versions} />;
}
