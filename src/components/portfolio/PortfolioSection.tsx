import type { ReactNode } from "react";
import type { PortfolioSectionId } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

type Props = {
  id: PortfolioSectionId;
  /** The small label above the heading — the same word the in-page nav uses. */
  eyebrow: string;
  title: string;
  children: ReactNode;
};

/**
 * One block of the portfolio, rising in as it scrolls into view. Unnumbered on
 * purpose: like the CV, the portfolio is read top to bottom as an
 * introduction, not navigated as a reference.
 */
export function PortfolioSection({ id, eyebrow, title, children }: Props) {
  return (
    <section id={id} className="pf-reveal flex flex-col gap-8 py-16">
      <div className="flex flex-col gap-3">
        <span className={`${AppTextStyles.CAPTION} flex items-center gap-3 font-medium uppercase tracking-[0.2em]`}>
          <span aria-hidden className="h-px w-8 bg-[var(--pf-a)]" />
          {eyebrow}
        </span>
        <h2 className={`${AppTextStyles.SECTION_TITLE} max-w-2xl`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
