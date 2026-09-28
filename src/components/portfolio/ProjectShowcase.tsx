import { ArrowUpRight, Code, Globe } from "lucide-react";
import { SpotlightCard } from "@/components/portfolio/SpotlightCard";
import type { Project } from "@/lib/cv/cv-types";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** A GitHub link gets a code glyph; anything else a globe. */
function linkIcon(href: string) {
  return new URL(href).hostname.replace(/^www\./, "") === "github.com" ? Code : Globe;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <SpotlightCard>
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <span className={AppTextStyles.MONO_LABEL}>{String(index + 1).padStart(2, "0")}</span>
        <h3 className={AppTextStyles.CARD_TITLE}>{project.name}</h3>
        <p className={AppTextStyles.BODY}>{project.description}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {project.links.map(({ label, href }) => {
            const Icon = linkIcon(href);

            return (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group/link flex h-10 items-center gap-2 rounded-xl border border-border-soft px-4 text-sm font-medium transition-colors hover:border-foreground/25"
              >
                <Icon aria-hidden className="size-4" />
                {label}
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 text-muted transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </a>
            );
          })}
        </div>
      </div>
    </SpotlightCard>
  );
}

/** The CV's projects, one card each, two to a row on wide screens. */
export function ProjectShowcase({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard key={project.name} project={project} index={index} />
      ))}
    </div>
  );
}
