import Link from "next/link";
import { routes } from "@/lib/routes/routes";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * Sticky top bar with the publisher name and a way home. The sections are
 * reached from the home page, so the bar carries nothing else.
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
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background transition-transform duration-200 group-hover:-rotate-6"
          >
            {publisher.trim().charAt(0).toUpperCase()}
          </span>
          {publisher}
        </Link>

        <nav className={AppTextStyles.SMALL}>
          <Link href={routes.home} className="transition-colors hover:text-foreground">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
