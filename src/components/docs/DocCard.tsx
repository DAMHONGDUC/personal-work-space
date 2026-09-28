import Link from "next/link";
import { AppIcon } from "@/components/shared/AppIcon";
import { Badge } from "@/components/ui/badge";
import {
  type Lang,
  type Doc,
  type DocSection,
} from "@/lib/docs/doc-model";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes/routes";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * One guide in the index. The sections are listed as their own links, so the
 * index doubles as a table of contents and you can jump straight to the part you
 * came for instead of opening the guide and hunting for it.
 *
 * `sections` is what the card lists, and it defaults to all of them. A search
 * passes only the ones that matched, so the links stay useful instead of
 * burying the hit in a list of twelve.
 */
export function DocCard({
  doc,
  lang,
  sections = doc.sections,
}: {
  doc: Doc;
  lang: Lang;
  sections?: DocSection[];
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(to bottom,
            ${AppColors.tint(AppColors.DOCS, 10)} 0%,
            transparent 100%)`,
        }}
      />

      <div className="relative flex flex-col gap-6 p-7">
        <div className="flex items-start gap-5">
          <AppIcon icon={doc.icon} accent={AppColors.DOCS} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {doc.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-md">
                  {tag}
                </Badge>
              ))}
            </div>
            {/* h3: the index shelves cards under a topic heading. */}
            <h3 className={AppTextStyles.CARD_TITLE}>
              <Link href={routes.doc(doc.slug)} className="transition-opacity hover:opacity-70">
                {/* Stretches over the whole card so the title is the click target
                    everywhere the section links are not. */}
                <span aria-hidden className="absolute inset-0" />
                <span lang={lang}>{doc.title}</span>
              </Link>
            </h3>
            <p lang={lang} className={AppTextStyles.BODY_SM}>
              {doc.tagline}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-3">
          <p className={AppTextStyles.EYEBROW}>
            {sections.length === doc.sections.length
              ? "Jump to a section"
              : `Matching ${sections.length === 1 ? "section" : "sections"}`}
          </p>
          <ul className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`${routes.doc(doc.slug)}#${section.id}`}
                  lang={lang}
                  className="relative flex items-center gap-2 rounded-lg border border-border-soft bg-background px-3 py-1.5 text-sm transition-colors hover:border-foreground/25"
                >
                  <span aria-hidden className={AppTextStyles.CAPTION}>
                    {doc.sections.indexOf(section) + 1}
                  </span>
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className={`${AppTextStyles.CAPTION} relative`}>
          {doc.sections.length} sections · {doc.readingTime} · Updated{" "}
          {formatDate(doc.lastUpdated)}
        </p>
      </div>
    </article>
  );
}
