import type { Metadata } from "next";
import { AppDirectory } from "@/components/directory/AppDirectory";
import type { DirectoryEntry } from "@/components/directory/AppCard";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, getApps, site } from "@/lib/apps/apps";
import { routes } from "@/lib/routes/routes";

export const metadata: Metadata = {
  title: "Apps",
  description: `Privacy policies for every app published by ${site.publisher}.`,
  alternates: { canonical: `${routes.apps}/` },
};

export default function AppsPage() {
  const apps = getApps();

  const entries: DirectoryEntry[] = apps.map((app) => ({
    slug: app.slug,
    name: app.name,
    tagline: app.tagline,
    icon: app.icon,
    accent: app.accent,
    platforms: app.platforms,
    updated: formatDate(app.lastUpdated),
  }));

  return (
    <PageContainer>
      <DirectoryHero publisher={site.publisher} appCount={apps.length} />
      <AppDirectory entries={entries} />
    </PageContainer>
  );
}
