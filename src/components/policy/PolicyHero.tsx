import Link from "next/link";
import { AppIcon } from "@/components/shared/AppIcon";
import { Badge } from "@/components/ui/badge";
import { formatDate, site, type App } from "@/lib/apps/apps";
import { routes } from "@/lib/routes/routes";
import { AppSpacings } from "@/lib/design/app-spacings";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

export function PolicyHero({ app }: { app: App }) {
  const links = [
    { label: "App Store", href: app.storeLinks?.appStore },
    { label: "Google Play", href: app.storeLinks?.playStore },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const meta = [
    { label: "Effective", value: formatDate(app.effectiveDate) },
    { label: "Last updated", value: formatDate(app.lastUpdated) },
    { label: "Publisher", value: site.publisher },
  ];

  return (
    <header className="relative border-b border-border-soft">
      {/* Runs up behind the transparent site header (h-16 = 4rem) so header and
          hero read as one gradient block at the top of the page. Once scrolled,
          the header turns solid and covers this. Stops decrease all the way down
          — any rise, however slight, reads as a bright band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 bottom-0"
        style={{
          background: `linear-gradient(to bottom,
            ${AppColors.tint(app.accent, 20)} 0%,
            ${AppColors.tint(app.accent, 15)} 30%,
            ${AppColors.tint(app.accent, 9)} 55%,
            ${AppColors.tint(app.accent, 3)} 78%,
            transparent 100%)`,
        }}
      />

      <div className={`relative mx-auto w-full max-w-5xl px-6 ${AppSpacings.HERO_BOTTOM} ${AppSpacings.PAGE_TOP}`}>
        <nav className={`${AppTextStyles.SMALL} pb-9`}>
          <Link
            href={routes.apps}
            className="transition-colors hover:text-foreground"
          >
            All apps
          </Link>
          <span className="px-2 opacity-50">/</span>
          <span className="text-foreground">{app.name}</span>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <AppIcon icon={app.icon} accent={app.accent} size="lg" />
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {app.platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="rounded-md">
                  {platform}
                </Badge>
              ))}
            </div>
            <h1 className={AppTextStyles.HERO_TITLE}>
              {app.name} Privacy Policy
            </h1>
            <p className={`${AppTextStyles.BODY} max-w-[60ch]`}>{app.tagline}</p>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-end justify-between gap-6">
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className={`${AppTextStyles.CAPTION} uppercase tracking-wider`}>
                  {item.label}
                </dt>
                <dd className="mt-1 font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-lg border border-border-soft bg-surface px-3.5 py-2 text-sm transition-colors hover:border-foreground/25"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
