import Link from "next/link";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

type Props = {
  href: string;
  icon: string;
  accent: string;
  title: string;
  description: string;
  /** Short status line in the footer, e.g. an item count or a date. */
  meta: string;
};

/** One of the two top-level sections on the landing page. */
export function HubCard({ href, icon, accent, title, description, meta }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-7 transition-colors hover:border-foreground/25"
    >
      {/* Same top-down tint as the app cards, so the two levels read as one set. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to bottom,
            ${AppColors.tint(accent, 16)} 0%,
            ${AppColors.tint(accent, 9)} 40%,
            ${AppColors.tint(accent, 3)} 72%,
            transparent 100%)`,
        }}
      />

      <span className="relative flex items-start justify-between gap-4">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border text-2xl"
          style={{
            backgroundColor: `${AppColors.tint(accent, 14)}`,
            borderColor: `${AppColors.tint(accent, 28)}`,
          }}
        >
          {icon}
        </span>
        <span className="mt-1 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">
          →
        </span>
      </span>

      <span className={`${AppTextStyles.CARD_TITLE_SM} relative mt-5 block`}>
        {title}
      </span>
      <span className={`${AppTextStyles.BODY_SM} relative mt-2 block`}>
        {description}
      </span>

      <span className={`${AppTextStyles.CAPTION} relative mt-6 block`}>{meta}</span>
    </Link>
  );
}
