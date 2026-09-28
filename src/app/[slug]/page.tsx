import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";
import { getApps, getApp } from "@/lib/apps/apps";
import { routes } from "@/lib/routes/routes";

export const dynamicParams = false;

// Kept so links published before the policies moved under /apps still land
// somewhere useful. Not indexed — the new address is canonical.
export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return getApps().map((app) => ({ slug: app.slug }));
}

export default async function AppIndexPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);

  if (!app) {
    notFound();
  }

  return (
    <LegacyRedirect
      href={routes.privacyPolicy(app.slug)}
      label={`the ${app.name} privacy policy`}
    />
  );
}
