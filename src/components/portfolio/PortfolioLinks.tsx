import { Briefcase, GitBranch, Globe, type LucideIcon } from "lucide-react";
import type { PortfolioLink } from "@/lib/portfolio/portfolio-model";

/**
 * lucide has no brand logos, so each kind gets the closest generic glyph;
 * the label is what actually names the site.
 */
const ICONS: Record<PortfolioLink["kind"], LucideIcon> = {
  github: GitBranch,
  linkedin: Briefcase,
  website: Globe,
};

/** `labelled` shows the name beside the icon; otherwise the icon stands alone. */
export function PortfolioLinks({ links, labelled = false }: { links: PortfolioLink[]; labelled?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = ICONS[link.kind];

        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={labelled ? undefined : link.label}
              title={link.label}
              className="flex h-10 items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 text-sm transition-colors hover:border-foreground/25"
            >
              <Icon aria-hidden className="size-4" />
              {labelled && link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
