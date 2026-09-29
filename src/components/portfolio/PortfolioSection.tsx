import type { ReactNode } from "react";
import { MaskedWords } from "@/components/portfolio/MaskedWords";
import { RevealSection } from "@/components/portfolio/RevealSection";
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
 * One block of the portfolio. No padding of its own: `PortfolioSections`
 * spaces the blocks, so every gap on the page is one value. It plays its entrance as it scrolls into view
 * (RevealSection): the heading rises, the rule before its label draws
 * itself, then the cards rise in one by one. Unnumbered on
 * purpose: like the CV, the portfolio is read top to bottom as an
 * introduction, not navigated as a reference.
 */
export function PortfolioSection({ id, eyebrow, title, children }: Props) {
  return (
    <RevealSection id={id} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className={`pf-head ${AppTextStyles.CAPTION} flex items-center gap-3 font-medium uppercase tracking-[0.2em]`}>
          <span aria-hidden className="pf-rule h-px w-8 bg-[var(--pf-a)]" />
          {eyebrow}
        </span>
        <h2 className={`pf-title ${AppTextStyles.SECTION_TITLE} max-w-2xl`}>
          <MaskedWords text={title} />
        </h2>
      </div>
      {children}
    </RevealSection>
  );
}
