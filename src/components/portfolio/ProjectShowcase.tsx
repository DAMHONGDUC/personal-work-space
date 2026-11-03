import { ArrowUpRight, Globe } from "lucide-react";
import { FaGithub, FaYoutube } from "react-icons/fa6";
import { ProjectIcon } from "@/components/portfolio/ProjectIcon";
import { SpotlightCard } from "@/components/portfolio/SpotlightCard";
import { ProjectCover } from "@/components/shared/ProjectCover";
import type { Project } from "@/lib/cv/cv-types";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import type { ProjectMedia } from "@/lib/projects/project-media";

/** A GitHub link gets GitHub's mark, a video YouTube's; anything else a globe. */
function linkIcon(href: string) {
  const host = new URL(href).hostname.replace(/^www\./, "");
  if (host === "github.com") return FaGithub;
  return host === "youtu.be" || host === "youtube.com" ? FaYoutube : Globe;
}

function ProjectCard({
  project,
  index,
  icon,
  media,
}: {
  project: Project;
  index: number;
  icon?: string;
  media?: ProjectMedia;
}) {
  // The demo video sits with the project's own links, after its code.
  const links = media ? [...project.links, { label: "Watch the demo", href: media.youtube }] : project.links;

  return (
    <SpotlightCard order={index}>
      <div className="flex h-full flex-col gap-5 p-6 md:p-8">
        {media && <ProjectCover src={media.cover} name={project.name} />}
        <div className="flex items-start justify-between gap-4">
          <ProjectIcon name={project.name} src={icon} />
          <span className={AppTextStyles.MONO_LABEL}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className={AppTextStyles.CARD_TITLE}>{project.name}</h3>
        <p className={AppTextStyles.BODY}>{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {links.map(({ label, href }) => {
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
 * its cover, when it has one, then its app icon — `icons` and `media` are keyed
 * by project name, and a project without an icon gets a placeholder. The
 * cover and video are the ones the Upwork tab offers.
 */
export function ProjectShowcase({
  projects,
  icons,
  media,
}: {
  projects: Project[];
  icons: Record<string, string>;
  media: Record<string, ProjectMedia>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.name}
          project={project}
          index={index}
          icon={icons[project.name]}
          media={media[project.name]}
        />
      ))}
    </div>
  );
}
