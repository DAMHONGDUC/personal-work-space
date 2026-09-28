import Link from "next/link";
import { AppIcon } from "@/components/shared/AppIcon";
import { Badge } from "@/components/ui/badge";
import { DOCS_ACCENT, type Lang, type Doc } from "@/lib/docs/doc-model";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes/routes";

/**
 * Header of one guide. Same gradient trick as the policy hero: it runs up behind
 * the transparent site header so the two read as one block at the top of the
 * page.
 */
export function DocHero({
  doc,
  lang,
  children,
}: {
  doc: Doc;
  lang: Lang;
  /** The language switch, placed alongside the guide's metadata. */
  children?: React.ReactNode;
}) {
  const meta = [
    { label: "Updated", value: formatDate(doc.lastUpdated) },
    { label: "Reading time", value: doc.readingTime },
    { label: "Sections", value: String(doc.sections.length) },
  ];

  return (
    <header className="relative border-b border-border-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 bottom-0"
        style={{
          background: `linear-gradient(to bottom,
            color-mix(in oklab, ${DOCS_ACCENT} 20%, transparent) 0%,
            color-mix(in oklab, ${DOCS_ACCENT} 15%, transparent) 30%,
            color-mix(in oklab, ${DOCS_ACCENT} 9%, transparent) 55%,
            color-mix(in oklab, ${DOCS_ACCENT} 3%, transparent) 78%,
            transparent 100%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 pb-12 pt-10">
        <nav className="pb-9 text-sm text-muted">
          <Link href={routes.docs} className="transition-colors hover:text-foreground">
            All guides
          </Link>
          <span className="px-2 opacity-50">/</span>
          <span className="text-foreground">{doc.title}</span>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <AppIcon icon={doc.icon} accent={DOCS_ACCENT} size="lg" />
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {doc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-md">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1
              lang={lang}
              className="text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.15]"
            >
              {doc.title}
            </h1>
            <p lang={lang} className="max-w-[60ch] text-base leading-7 text-muted">
              {doc.tagline}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-end justify-between gap-6">
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-wider text-muted">
                  {item.label}
                </dt>
                <dd lang={lang} className="mt-1 font-medium">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {children}
        </div>
      </div>
    </header>
  );
}
