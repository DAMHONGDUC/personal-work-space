import Link from "next/link";
import { AppIcon } from "@/components/shared/AppIcon";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/routes/routes";

export type DirectoryEntry = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  platforms: string[];
  updated: string;
};

export function AppCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <Link
      href={routes.privacyPolicy(entry.slug)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-foreground/25"
    >
      {/* Even top-down tint on hover; a radial glow reads as an off-centre blob. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to bottom,
            color-mix(in oklab, ${entry.accent} 16%, transparent) 0%,
            color-mix(in oklab, ${entry.accent} 9%, transparent) 40%,
            color-mix(in oklab, ${entry.accent} 3%, transparent) 72%,
            transparent 100%)`,
        }}
      />

      <span className="relative flex items-start justify-between gap-4">
        <AppIcon icon={entry.icon} accent={entry.accent} />
        <span className="mt-1 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">
          →
        </span>
      </span>

      <span className="relative mt-4 block font-semibold tracking-tight">
        {entry.name}
      </span>
      <span className="relative mt-1.5 block text-sm leading-6 text-muted">
        {entry.tagline}
      </span>

      <span className="relative mt-5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        {entry.platforms.map((platform) => (
          <Badge key={platform} variant="outline" className="rounded-md">
            {platform}
          </Badge>
        ))}
        <span className="ml-auto">Updated {entry.updated}</span>
      </span>
    </Link>
  );
}
