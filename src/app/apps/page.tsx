import type { Metadata } from "next";
import { AppDirectory } from "@/components/directory/AppDirectory";
import type { DirectoryEntry } from "@/components/directory/AppCard";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { formatDate, getApps, site } from "@/lib/apps";
import { routes } from "@/lib/routes";

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
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <DirectoryHero publisher={site.publisher} appCount={apps.length} />
      <AppDirectory entries={entries} />
    </main>
  );
}
