import Link from "next/link";
import { withBasePath } from "@/lib/routes/routes";
import { AppSpacings } from "@/lib/design/app-spacings";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * Stand-in for a 301 on paths that have moved.
 *
 * A static export has no server, so a redirect has to happen in the document:
 * a meta refresh (which works without JavaScript) plus a visible link as the
 * fallback. Pair this with `robots: { index: false }` on the page so search
 * engines keep only the new address.
 */
export function LegacyRedirect({ href, label }: { href: string; label: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${withBasePath(`${href}/`)}`} />
      <main className={`mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-6 ${AppSpacings.PAGE_TOP} ${AppSpacings.PAGE_BOTTOM}`}>
        <p className={AppTextStyles.MONO_LABEL}>This page has moved</p>
        <h1 className={AppTextStyles.COMPACT_TITLE}>
          Redirecting to {label}…
        </h1>
        <Link
          href={href}
          className="mt-2 rounded-lg border border-border-soft px-4 py-2 text-sm transition-colors hover:border-foreground/25"
        >
          Continue
        </Link>
      </main>
    </>
  );
}
