import type { ReactNode } from "react";
import { AppSpacings } from "@/lib/design/app-spacings";

/**
 * The portfolio's sections, stacked with `AppSpacings.PORTFOLIO_GAP` — the
 * same gap `PortfolioTheme` puts between the hero and this stack, so the
 * hero-to-About gap and every section-to-section gap are one value.
 */
export function PortfolioSections({ children }: { children: ReactNode }) {
  return <div className={`flex flex-col ${AppSpacings.PORTFOLIO_GAP}`}>{children}</div>;
}
