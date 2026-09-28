import type { MetadataRoute } from "next";
import { getApps, site } from "@/lib/apps/apps";
import { cv } from "@/lib/cv/cv";
import { getDocBundles } from "@/lib/docs/docs";
import { getEffectCategories } from "@/lib/effects/effects";
import { routes } from "@/lib/routes/routes";

// Required so the sitemap is emitted as a file by `output: "export"`.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: `${site.url}${routes.apps}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    ...getApps().map((app) => ({
      url: `${site.url}${routes.privacyPolicy(app.slug)}/`,
      lastModified: new Date(`${app.lastUpdated}T00:00:00Z`),
      changeFrequency: "yearly" as const,
    })),
    {
      url: `${site.url}${routes.docs}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    ...getDocBundles().map((bundle) => ({
      url: `${site.url}${routes.doc(bundle.slug)}/`,
      lastModified: new Date(`${bundle.versions.en.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${site.url}${routes.effects}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    ...getEffectCategories().map((category) => ({
      url: `${site.url}${routes.effectCategory(category.id)}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    })),
    {
      url: `${site.url}${routes.cv}/`,
      lastModified: new Date(`${cv.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly",
    },
    // The legacy /<slug>/... redirects are deliberately absent: they are
    // noindex, and listing them would compete with the canonical paths.
  ];
}
