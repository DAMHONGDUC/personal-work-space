import { ArrowUpRight, Globe } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { ProjectIcon } from "@/components/portfolio/ProjectIcon";
import { SpotlightCard } from "@/components/portfolio/SpotlightCard";
import type { Project } from "@/lib/cv/cv-types";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** A GitHub link gets GitHub's mark; anything else a globe. */
function linkIcon(href: string) {
  return new URL(href).hostname.replace(/^www\./, "") === "github.com" ? FaGithub : Globe;
}

function ProjectCard({ project, index, icon }: { project: Project; index: number; icon?: string }) {
  return (
    <SpotlightCard order={index}>
      <div className="flex h-full flex-col gap-5 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <ProjectIcon name={project.name} src={icon} />
          <span className={AppTextStyles.MONO_LABEL}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className={AppTextStyles.CARD_TITLE}>{project.name}</h3>
        <p className={AppTextStyles.BODY}>{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
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

/**
 * The CV's projects, one card each, two to a row on wide screens, each led by
 * its app icon — `icons` is keyed by project name, and a project without one
 * gets a placeholder.
 */
export function ProjectShowcase({ projects, icons }: { projects: Project[]; icons: Record<string, string> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard key={project.name} project={project} index={index} icon={icons[project.name]} />
      ))}
    </div>
  );
}
