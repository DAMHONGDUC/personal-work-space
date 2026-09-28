import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A name that opens its website in a new tab when the data gives it one — a
 * school, a company — and plain text when it does not.
 */
export function ExternalLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <>{children}</>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/ext inline-flex items-center gap-0.5 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--pf-a)]"
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-3.5 transition-transform group-hover/ext:-translate-y-0.5 group-hover/ext:translate-x-0.5"
      />
    </a>
  );
}
