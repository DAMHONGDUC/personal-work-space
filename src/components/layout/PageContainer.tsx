import type { ReactNode } from "react";
import { AppSpacings } from "@/lib/design/app-spacings";

/**
 * The spacing a page's content sits in. The values come from `AppSpacings`, so
 * the gap under the header is the same on every page.
 *
 * - `page`: the first thing under the header.
 * - `afterHero`: follows a full-width hero, which brings its own top spacing.
 * - `flush`: follows a hero whose sections carry their own spacing.
 * - `message`: a short standalone message, such as the 404.
 */
const SPACING = {
  page: `${AppSpacings.PAGE_TOP} ${AppSpacings.PAGE_BOTTOM}`,
  afterHero: `${AppSpacings.AFTER_HERO} ${AppSpacings.PAGE_BOTTOM}`,
  flush: AppSpacings.PAGE_BOTTOM,
  message: `flex flex-col items-start gap-4 ${AppSpacings.PAGE_TOP} ${AppSpacings.PAGE_BOTTOM}`,
} as const;

export type PageSpacing = keyof typeof SPACING;

/**
 * The `<main>` of every page: the site's content width and gutters, with the
 * vertical rhythm picked by name. Route files compose this rather than
 * writing layout classes — pages hold structure, components hold style.
 */
export function PageContainer({
  spacing = "page",
  children,
}: {
  spacing?: PageSpacing;
  children: ReactNode;
}) {
  return <main className={`mx-auto w-full max-w-5xl px-6 ${SPACING[spacing]}`}>{children}</main>;
}
