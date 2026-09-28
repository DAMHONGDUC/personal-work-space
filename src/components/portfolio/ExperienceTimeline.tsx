import { GlassCard } from "@/components/portfolio/GlassCard";
import type { PortfolioJob } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** `TGL Solutions` -> `TS`: what the card shows when there is no logo. */
function initials(company: string): string {
  return company
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * The jobs, newest first, hung off a hairline. The newest one's dot takes the
 * accent, because it is the one still running.
 */
export function ExperienceTimeline({ jobs }: { jobs: PortfolioJob[] }) {
  return (
    <ol className="relative flex flex-col gap-6 pl-8 sm:pl-10">
      <span
        aria-hidden
        className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-border sm:left-[0.9375rem]"
      />

      {jobs.map((job, index) => (
        <li key={`${job.company}-${job.period}`} className="relative">
          <span
            aria-hidden
            className="absolute -left-8 top-7 flex size-6 items-center justify-center rounded-full border border-border-soft bg-background sm:-left-10 sm:size-8"
          >
            <span className={`size-2 rounded-full ${index === 0 ? "bg-[var(--pf-a)]" : "bg-muted-foreground/40"}`} />
          </span>

          <GlassCard as="article" className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-muted-surface text-sm font-semibold"
            >
              {initials(job.company)}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <div>
                  <h3 className={AppTextStyles.CARD_TITLE_SM}>{job.role}</h3>
                  <p className={AppTextStyles.SMALL}>{job.company}</p>
                </div>
                <span className={`${AppTextStyles.CAPTION} w-fit shrink-0 rounded-full border border-border-soft px-3 py-1`}>
                  {job.period}
                </span>
              </div>
              <ul className={`${AppTextStyles.BODY_SM} flex flex-col gap-1.5`}>
                {job.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </li>
      ))}
    </ol>
  );
}
