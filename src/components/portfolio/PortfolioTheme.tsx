import type { CSSProperties, ReactNode } from "react";
import { AppColors } from "@/lib/design/app-colors";

/**
 * Hands the portfolio's accent to everything inside as `--pf-a`, which the
 * components and the `.pf-*` rules in globals.css read. Set once here, so no
 * component repeats a hex value.
 */
export function PortfolioTheme({ children }: { children: ReactNode }) {
  const vars = { "--pf-a": AppColors.PORTFOLIO } as CSSProperties;

  return (
    <div style={vars} className="relative overflow-x-clip">
      {children}
    </div>
  );
}
