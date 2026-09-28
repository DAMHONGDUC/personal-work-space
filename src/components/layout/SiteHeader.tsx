import Link from "next/link";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { routes } from "@/lib/routes/routes";

/**
 * Sticky top bar with the publisher name and, on the right, `HeaderNav`: the
 * way home, or on a page with its own sections — the portfolio — those
 * sections, pinned while the page scrolls.
 *
 * The background is driven entirely by CSS (see `.site-header` in globals.css):
 * solid by default, and transparent only at the very top of the page where a
 * scroll-driven animation is supported, so a hero gradient can run through it
 * as one unbroken block. No client JavaScript is involved, so it cannot end up
 * stuck transparent if hydration or an animation stalls.
 */
export function SiteHeader({ publisher }: { publisher: string }) {
  return (
    <header className="site-header sticky top-0 z-20 border-b">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-6">
        <Link
          href={routes.home}
          className="group flex shrink-0 items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background transition-transform duration-200 group-hover:-rotate-6"
          >
            {publisher.trim().charAt(0).toUpperCase()}
          </span>
          <span className="[header:has([data-sections])_&]:max-sm:hidden">{publisher}</span>
        </Link>

        <HeaderNav />
      </div>
    </header>
  );
}
