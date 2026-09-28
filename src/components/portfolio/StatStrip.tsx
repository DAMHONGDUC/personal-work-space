import type { PortfolioStat } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** The figures under the hero: a large number over a short label, divided by hairlines. */
export function StatStrip({ stats }: { stats: PortfolioStat[] }) {
  return (
    <dl className="grid grid-cols-2 border-y border-border-soft sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col-reverse gap-1 px-1 py-5 sm:border-l sm:border-border-soft sm:px-6 sm:first:border-l-0 sm:first:pl-0"
        >
          <dt className={`${AppTextStyles.CAPTION} uppercase tracking-wider`}>{stat.label}</dt>
          <dd className="text-3xl font-semibold tracking-tight">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
