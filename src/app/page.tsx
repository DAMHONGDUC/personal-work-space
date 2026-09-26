import { HubCard } from "@/components/home/HubCard";
import { formatDate, getApps, site } from "@/lib/apps";
import { cv } from "@/lib/cv";
import { DOCS_ACCENT } from "@/lib/doc-model";
import { getDocBundles } from "@/lib/docs";
import { EFFECTS_ACCENT } from "@/lib/effect-model";
import { getEffectCategories } from "@/lib/effects";
import { routes } from "@/lib/routes";

export default function Home() {
  const apps = getApps();
  const docs = getDocBundles();
  const effectCategories = getEffectCategories();
  const effectCount = effectCategories.reduce((sum, category) => sum + category.total, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="flex max-w-2xl flex-col gap-5 pb-14">
        <span className="w-fit rounded-full border border-border-soft px-3 py-1 text-xs text-muted">
          {site.publisher}
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Home
        </h1>
        <p className="text-lg leading-8 text-muted">
          {site.description}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <HubCard
          href={routes.apps}
          icon="🛡️"
          accent="#6366f1"
          title="App privacy policies"
          description="One permanent page per published app, describing exactly what it collects and why."
          meta={`${apps.length} ${apps.length === 1 ? "app" : "apps"}`}
        />
        <HubCard
          href={routes.docs}
          icon="🛠️"
          accent={DOCS_ACCENT}
          title="Guides"
          description="Setup notes written down once, with every section linked so you can start where you are stuck."
          meta={`${docs.length} ${docs.length === 1 ? "guide" : "guides"}`}
        />
        <HubCard
          href={routes.effects}
          icon="🎬"
          accent={EFFECTS_ACCENT}
          title="Effects library"
          description="Transitions, sound effects, overlays and animated elements for video editing, sorted by category with a preview for each."
          meta={`${effectCount} files in ${effectCategories.length} categories`}
        />
        <HubCard
          href={routes.cv}
          icon="📄"
          accent="#0ea5e9"
          title="CV"
          description="Background, experience and contact details, available to read online or download."
          meta={`Updated ${formatDate(cv.lastUpdated)}`}
        />
      </div>
    </main>
  );
}
