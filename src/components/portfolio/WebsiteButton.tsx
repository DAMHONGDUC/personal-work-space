import { ArrowUpRight, Globe } from "lucide-react";

/** `https://www.tgl-sol.com/` -> `tgl-sol.com`: what the button shows. */
export function websiteHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * A button that opens a school's or company's website in a new tab: a globe,
 * the site's address and an arrow out, in a bordered pill, so it reads as
 * something to press rather than as part of the text around it. Renders
 * nothing when the CV gives no website.
 */
export function WebsiteButton({ href, name }: { href?: string; name: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${name}'s website, ${websiteHost(href)} (opens in a new tab)`}
      className="group/web inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:border-[var(--pf-a)] hover:bg-muted-surface"
    >
      <Globe aria-hidden className="size-3.5 text-[var(--pf-a)]" />
      {websiteHost(href)}
      <ArrowUpRight
        aria-hidden
        className="size-3.5 text-muted transition-transform group-hover/web:-translate-y-0.5 group-hover/web:translate-x-0.5"
      />
    </a>
  );
}
