import { HubCard } from "@/components/home/HubCard";
import { CardGrid } from "@/components/layout/CardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/layout/PageIntro";
import { formatDate, getApps, site } from "@/lib/apps/apps";
import { cv } from "@/lib/cv/cv";
import { getDocBundles } from "@/lib/docs/docs";
import { getEffectCategories } from "@/lib/effects/effects";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";

export default function Home() {
  const apps = getApps();
  const docs = getDocBundles();
  const effectCategories = getEffectCategories();
  const effectCount = effectCategories.reduce((sum, category) => sum + category.total, 0);

  return (
    <PageContainer>
      <PageIntro eyebrow={site.publisher} title="Home">
        {site.description}
      </PageIntro>

      <CardGrid>
        <HubCard
          href={routes.apps}
          icon="🛡️"
          accent={AppColors.APPS}
          title="App privacy policies"
          description="One permanent page per published app, describing exactly what it collects and why."
          meta={`${apps.length} ${apps.length === 1 ? "app" : "apps"}`}
        />
        <HubCard
          href={routes.docs}
          icon="🛠️"
          accent={AppColors.DOCS}
          title="Guides"
          description="Setup notes written down once, with every section linked so you can start where you are stuck."
          meta={`${docs.length} ${docs.length === 1 ? "guide" : "guides"}`}
        />
        <HubCard
          href={routes.effects}
          icon="🎬"
          accent={AppColors.EFFECTS}
          title="Effects library"
          description="Transitions, sound effects, overlays and animated elements for video editing, sorted by category with a preview for each."
          meta={`${effectCount} files in ${effectCategories.length} categories`}
        />
        <HubCard
          href={routes.cv}
          icon="📄"
          accent={AppColors.CV}
          title="CV"
          description="Background, experience and contact details, available to read online or download."
          meta={`Updated ${formatDate(cv.lastUpdated)}`}
        />
      </CardGrid>
    </PageContainer>
  );
}
