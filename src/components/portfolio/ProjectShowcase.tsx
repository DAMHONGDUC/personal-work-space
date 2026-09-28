import { ArrowUpRight, CirclePlay, Code } from "lucide-react";
import { PublicImage } from "@/components/portfolio/PublicImage";
import { SpotlightCard } from "@/components/portfolio/SpotlightCard";
import type { PortfolioProject } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

function ProjectCard({ project, index }: { project: PortfolioProject; index: number }) {
  const links = [
    { label: "Source code", href: project.source, Icon: Code },
    { label: "Watch demo", href: project.demo, Icon: CirclePlay },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  return (
    <SpotlightCard>
      <div className="grid items-center gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:p-8">
        {/* The shot sits in a window frame on a plain panel. */}
        <div className="relative rounded-xl bg-muted-surface p-4 sm:p-6">
          <div className="overflow-hidden rounded-lg border border-border-soft bg-background shadow-lg transition-transform duration-500 group-hover:scale-[1.01]">
            <div aria-hidden className="flex gap-1.5 border-b border-border-soft px-3 py-2">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <PublicImage src={project.image} alt={`${project.name} preview`} className="w-full bg-white object-contain" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <span className={AppTextStyles.MONO_LABEL}>{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-3xl font-semibold tracking-tight">{project.name}</h3>
          <p className={AppTextStyles.BODY}>{project.description}</p>

          <ul className="flex flex-wrap gap-1.5">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-lg border border-border-soft bg-muted-surface px-2.5 py-1 font-mono text-xs"
              >
                {technology}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 pt-1">
            {links.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group/link flex h-10 items-center gap-2 rounded-xl border border-border-soft px-4 text-sm font-medium transition-colors hover:border-foreground/25"
              >
                <Icon aria-hidden className="size-4 text-muted" />
                {label}
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 text-muted transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function ProjectShowcase({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div className="flex flex-col gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={project.name} project={project} index={index} />
      ))}
    </div>
  );
}
