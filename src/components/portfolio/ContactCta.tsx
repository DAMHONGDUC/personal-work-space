import { Mail } from "lucide-react";
import { CopyEmailButton } from "@/components/portfolio/CopyEmailButton";
import { PortfolioLinks } from "@/components/portfolio/PortfolioLinks";
import type { Portfolio } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** The closing call to action: a plain card with every way to get in touch. */
export function ContactCta({ portfolio }: { portfolio: Portfolio }) {
  const { contact, email } = portfolio;

  return (
    <div className="pf-item relative overflow-hidden rounded-2xl border border-border-soft bg-surface px-6 py-14 text-center sm:px-12">
      <div aria-hidden className="pf-dots pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-7">
        <h3 className={AppTextStyles.PAGE_TITLE}>
          Let&apos;s build something together<span className="text-[var(--pf-a)]">.</span>
        </h3>
        <p className={AppTextStyles.LEAD}>{contact.title}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${email}`}
            className="flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
          >
            <Mail aria-hidden className="size-4" />
            {email}
          </a>
          <CopyEmailButton email={email} />
        </div>

        <PortfolioLinks links={portfolio.links} labelled />
      </div>
    </div>
  );
}
