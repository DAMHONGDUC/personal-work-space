import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Avatar } from "@/components/portfolio/Avatar";
import { HeroBackdrop } from "@/components/portfolio/HeroBackdrop";
import { MaskedWords } from "@/components/portfolio/MaskedWords";
import { PortfolioLinks } from "@/components/portfolio/PortfolioLinks";
import { StatStrip } from "@/components/portfolio/StatStrip";
import { StatusPill } from "@/components/portfolio/StatusPill";
import { enterStyle } from "@/components/portfolio/enter-style";
import type { Portfolio, PortfolioStat } from "@/lib/portfolio/portfolio-model";
import { routes } from "@/lib/routes/routes";
import { AppSpacings } from "@/lib/design/app-spacings";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The first screen: who, what, and the two ways onward — get in touch or read
 * the CV — with the figures below. The page's contents live in the site
 * header, pinned while the page scrolls. Type does the work;
 * colour appears only as the accent full stop after the role.
 */
export function PortfolioHero({ portfolio, stats }: { portfolio: Portfolio; stats: PortfolioStat[] }) {
  return (
    <header className="relative">
      <HeroBackdrop />

      <div className={`relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 ${AppSpacings.PAGE_TOP}`}>
        <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:justify-between">
          <div className="flex max-w-2xl flex-col gap-6">
            {portfolio.status && (
              <div className="pf-enter" style={enterStyle(0)}>
                <StatusPill>{portfolio.status}</StatusPill>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <p className="pf-enter text-lg text-muted" style={enterStyle(80)}>
                {portfolio.greeting}{" "}
                <span aria-hidden className="inline-block origin-[70%_70%] motion-safe:animate-[pf-wave_1.8s_ease-in-out_0.9s_2]">
                  👋
                </span>
              </p>
              <h1 className={`pf-words-enter ${AppTextStyles.DISPLAY}`} style={enterStyle(160)}>
                <MaskedWords text={portfolio.name} />
              </h1>
              <p className="pf-enter text-xl font-medium tracking-tight text-muted sm:text-2xl" style={enterStyle(240)}>
                {portfolio.role}
                <span aria-hidden className="text-[var(--pf-a)]">.</span>
              </p>
            </div>

            <p className={`pf-enter ${AppTextStyles.LEAD}`} style={enterStyle(320)}>
              {portfolio.headline}
            </p>

            <div className="pf-enter flex flex-wrap items-center gap-3" style={enterStyle(400)}>
              <a
                href="#contact"
                className="group flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
              >
                Get in touch
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href={routes.cv}
                className="flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-surface px-5 text-sm font-medium transition-colors hover:border-foreground/25"
              >
                <FileText aria-hidden className="size-4 text-muted" />
                Read my CV
              </Link>
              <PortfolioLinks links={portfolio.links} />
            </div>
          </div>

          <Avatar src={portfolio.photo} alt={portfolio.name} badge={`📍 ${portfolio.location}`} delay={150} />
        </div>

        <div className="pf-enter" style={enterStyle(520)}>
          <StatStrip stats={stats} delay={700} />
        </div>
      </div>
    </header>
  );
}
