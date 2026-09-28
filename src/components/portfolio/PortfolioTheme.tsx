import type { CSSProperties, ReactNode } from "react";
import { AppColors } from "@/lib/design/app-colors";
import { AppSpacings } from "@/lib/design/app-spacings";

/**
 * Hands the portfolio's accent to everything inside as `--pf-a`, which the
 * components and the `.pf-*` rules in globals.css read. Set once here, so no
 * component repeats a hex value. It also stacks the hero and the body with
 * `AppSpacings.PORTFOLIO_GAP` — the same gap `PortfolioSections` puts between
 * sections.
 */
export function PortfolioTheme({ children }: { children: ReactNode }) {
  const vars = { "--pf-a": AppColors.PORTFOLIO } as CSSProperties;

  return (
    <div style={vars} className={`relative flex flex-col overflow-x-clip ${AppSpacings.PORTFOLIO_GAP}`}>
      {children}
    </div>
  );
}
