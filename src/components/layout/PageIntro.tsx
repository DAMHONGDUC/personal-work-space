import type { ReactNode } from "react";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The opening of a page that has no hero: an optional chip, the h1, and one
 * lead paragraph. Every section index opens this way, so they read as one set.
 */
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  /** The lead paragraph. */
  children: ReactNode;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-5 pb-12">
      {eyebrow && (
        <span className={`${AppTextStyles.CAPTION} w-fit rounded-full border border-border-soft px-3 py-1`}>
          {eyebrow}
        </span>
      )}
      <h1 className={AppTextStyles.PAGE_TITLE}>{title}</h1>
      <p className={AppTextStyles.LEAD}>{children}</p>
    </div>
  );
}
