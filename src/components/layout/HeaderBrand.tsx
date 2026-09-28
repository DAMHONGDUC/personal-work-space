"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useStandalonePage } from "@/hooks/layout/useStandalonePage";
import { routes } from "@/lib/routes/routes";

/**
 * The publisher's initial and name at the left of the header.
 *
 * On an ordinary page it goes home. On a standalone page — the portfolio — it
 * stays on the page and scrolls back to its top, so that page never leads out
 * to the rest of the site. The href is still the page's own path, so it does
 * the same without JavaScript, by reloading it.
 */
export function HeaderBrand({ publisher }: { publisher: string }) {
  const standalone = useStandalonePage();

  function backToTop(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.scrollTo({ top: 0 });
    // Drop a section anchor from the address, so a refresh starts at the top too.
    window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <Link
      href={standalone ? standalone.path : routes.home}
      onClick={standalone ? backToTop : undefined}
      className="group flex shrink-0 items-center gap-2.5 text-sm font-semibold tracking-tight"
    >
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background transition-transform duration-200 group-hover:-rotate-6"
      >
        {publisher.trim().charAt(0).toUpperCase()}
      </span>
      {/* On a phone a standalone page needs the width for its sections. */}
      <span className={standalone ? "max-sm:hidden" : undefined}>{publisher}</span>
    </Link>
  );
}
