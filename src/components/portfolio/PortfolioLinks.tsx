import { Globe } from "lucide-react";
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import type { PortfolioLink } from "@/lib/portfolio/portfolio-model";

/**
 * The real marks for the two profiles, from react-icons' Font Awesome brands
 * set — lucide has no brand logos, and a stand-in glyph reads as a mistake.
 * Anything else the CV links to gets a plain globe.
 */
const ICONS: Record<PortfolioLink["kind"], IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
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
