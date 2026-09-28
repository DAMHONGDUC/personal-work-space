import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AboutBento } from "@/components/portfolio/AboutBento";
import { ContactCta } from "@/components/portfolio/ContactCta";
import { ExperienceTimeline } from "@/components/portfolio/ExperienceTimeline";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioSection } from "@/components/portfolio/PortfolioSection";
import { PortfolioSections } from "@/components/portfolio/PortfolioSections";
import { PortfolioTheme } from "@/components/portfolio/PortfolioTheme";
import { ProjectShowcase } from "@/components/portfolio/ProjectShowcase";
import { SkillGroups } from "@/components/portfolio/SkillGroups";
import { portfolio, portfolioStats } from "@/lib/portfolio/portfolio";
import { routes } from "@/lib/routes/routes";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `${portfolio.name} — ${portfolio.role}. Skills, experience and projects.`,
  alternates: { canonical: `${routes.portfolio}/` },
};

export default function PortfolioPage() {
  return (
    <PortfolioTheme>
      <PortfolioHero portfolio={portfolio} stats={portfolioStats()} />

      <PageContainer spacing="flush">
        <PortfolioSections>
          <PortfolioSection id="about" eyebrow="About me" title={portfolio.about.title}>
            <AboutBento portfolio={portfolio} />
          </PortfolioSection>

          <PortfolioSection id="skills" eyebrow="Skills" title="What I work with">
            <SkillGroups skills={portfolio.skills} icons={portfolio.skillIcons} />
          </PortfolioSection>

          <PortfolioSection id="experience" eyebrow="Experience" title="Where I have worked">
            <ExperienceTimeline jobs={portfolio.experience} />
          </PortfolioSection>

          <PortfolioSection id="projects" eyebrow="Projects" title="Things I have built">
            <ProjectShowcase projects={portfolio.projects} icons={portfolio.projectIcons} />
          </PortfolioSection>

          <PortfolioSection id="contact" eyebrow="Contact" title="Get in touch">
            <ContactCta portfolio={portfolio} />
          </PortfolioSection>
        </PortfolioSections>
      </PageContainer>
    </PortfolioTheme>
  );
}
