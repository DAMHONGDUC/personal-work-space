import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { NavItem } from "@/components/policy/PolicyNav";
import { PageContainer } from "@/components/layout/PageContainer";
import { WithSidebar } from "@/components/layout/WithSidebar";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { Bullets } from "@/components/policy/Bullets";
import { PolicyHero } from "@/components/policy/PolicyHero";
import { MobileToc, SidebarToc } from "@/components/policy/PolicyToc";
import { Prose } from "@/components/policy/Prose";
import { Section } from "@/components/policy/Section";
import { CollectedSection } from "@/components/policy/sections/CollectedSection";
import { ContactCard } from "@/components/policy/sections/ContactCard";
import { NotCollectedSection } from "@/components/policy/sections/NotCollectedSection";
import { PermissionsSection } from "@/components/policy/sections/PermissionsSection";
import { SummarySection } from "@/components/policy/sections/SummarySection";
import { ThirdPartiesSection } from "@/components/policy/sections/ThirdPartiesSection";
import {
  contactEmail,
  formatDate,
  getApp,
  getApps,
  getOverview,
  getSections,
} from "@/lib/apps/apps";
import { routes } from "@/lib/routes/routes";

export function generateStaticParams() {
  return getApps().map((app) => ({ slug: app.slug }));
}

export async function generateMetadata(
  props: PageProps<"/apps/[slug]/privacy_policy">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const app = getApp(slug);

  if (!app) {
    return { title: "Not found" };
  }

  const title = `${app.name} Privacy Policy`;
  const description = `How ${app.name} handles your data. Last updated ${formatDate(app.lastUpdated)}.`;

  return {
    title,
    description,
    alternates: { canonical: `${routes.privacyPolicy(app.slug)}/` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function PrivacyPolicyPage(
  props: PageProps<"/apps/[slug]/privacy_policy">,
) {
  const { slug } = await props.params;
  const app = getApp(slug);

  if (!app) {
    notFound();
  }

  const sections = getSections(app);
  const overview = getOverview(app);
  const email = contactEmail(app);

  const toc: NavItem[] = [
    ...(overview.length ? [{ id: "overview", title: "Overview" }] : []),
    { id: "at-a-glance", title: "At a glance" },
    { id: "data-collected", title: "Data we collect" },
    { id: "data-not-collected", title: "Data we do not collect" },
    ...(app.permissions.length ? [{ id: "permissions", title: "Device permissions" }] : []),
    ...(app.thirdParties.length ? [{ id: "third-parties", title: "Third-party services" }] : []),
    ...sections.map((section) => ({ id: section.id, title: section.title })),
  ];

  // Both the headings and the contents number themselves from this one list,
  // so a section that only renders for some apps cannot shift one and not the
  // other.
  const numberOf = (id: string) => toc.findIndex((item) => item.id === id) + 1;

  return (
    <>
      <ReadingProgress accent={app.accent} />

      <PolicyHero app={app} />

      <PageContainer spacing="afterHero">
        <MobileToc items={toc} accent={app.accent} />

        <WithSidebar sidebar={<SidebarToc items={toc} accent={app.accent} />}>
            {overview.length > 0 && (
              <Section
                id="overview"
                number={numberOf("overview")}
                title="Overview"
                accent={app.accent}
              >
                <Prose paragraphs={overview} />
              </Section>
            )}

            <SummarySection app={app} number={numberOf("at-a-glance")} />
            <CollectedSection app={app} number={numberOf("data-collected")} />
            <NotCollectedSection app={app} number={numberOf("data-not-collected")} />

            {app.permissions.length > 0 && <PermissionsSection app={app} number={numberOf("permissions")} />}
            {app.thirdParties.length > 0 && <ThirdPartiesSection app={app} number={numberOf("third-parties")} />}

            {sections.map((section) => (
              <Section
                key={section.id}
                id={section.id}
                number={numberOf(section.id)}
                title={section.title}
                accent={app.accent}
              >
                <Prose paragraphs={section.body} />
                {section.list && <Bullets items={section.list} accent={app.accent} />}
              </Section>
            ))}

            <ContactCard app={app} email={email} />
        </WithSidebar>
      </PageContainer>
    </>
  );
}
