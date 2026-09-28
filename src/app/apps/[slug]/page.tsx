import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";
import { getApps, getApp } from "@/lib/apps/apps";
import { routes } from "@/lib/routes/routes";

export const dynamicParams = false;

// `/apps/<app>` is a convenience entry point: the policy is the only page an
// app has, so trimming the URL lands there rather than on a 404. Not indexed,
// so only the policy itself is listed.
export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return getApps().map((app) => ({ slug: app.slug }));
}

export default async function AppIndexPage({ params }: PageProps<"/apps/[slug]">) {
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
