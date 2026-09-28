import type { ReactNode } from "react";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * A one-line heading for a reference tool: title, a short description, and an
 * action on the right. The page is for looking things up, so the content
 * starts above the fold instead of under a hero.
 */
export function CompactPageHeader({
  title,
  description,
  leading,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  /** Drawn before the title, e.g. a category icon. */
  leading?: ReactNode;
  /** Drawn above the title, e.g. a link back to the index. */
  breadcrumb?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 pb-6">
      {leading}
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumb && <nav className={AppTextStyles.CAPTION}>{breadcrumb}</nav>}
        <h1 className={AppTextStyles.COMPACT_TITLE}>{title}</h1>
        {description && <p className={AppTextStyles.SMALL}>{description}</p>}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
