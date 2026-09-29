import { CountUp } from "@/components/portfolio/CountUp";
import type { PortfolioStat } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The figures under the hero: a large number over a short label, divided by
 * hairlines. Each number counts up from zero, one a beat after the other,
 * starting `delay` ms into the hero's opening sequence.
 */
export function StatStrip({ stats, delay = 0 }: { stats: PortfolioStat[]; delay?: number }) {
  return (
    <dl className="grid grid-cols-2 border-y border-border-soft sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex flex-col-reverse gap-1 px-1 py-5 sm:border-l sm:border-border-soft sm:px-6 sm:first:border-l-0 sm:first:pl-0"
        >
          <dt className={`${AppTextStyles.CAPTION} uppercase tracking-wider`}>{stat.label}</dt>
          <dd className="text-3xl font-semibold tabular-nums tracking-tight">
            <CountUp value={stat.value} delay={delay + index * 120} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
