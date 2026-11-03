import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The heading of a scrolled block in a sidebar ("Base docs", "On this page"):
 * a band tinted with the accent that stays at the top of the block while its
 * list scrolls under it, so each block reads as its own and is named in view.
 */
export function PanelHeading({ accent, children }: { accent: string; children: React.ReactNode }) {
  const tint = AppColors.tint(accent, 12);

  return (
    <p
      className={`${AppTextStyles.EYEBROW} sticky top-0 z-10 flex items-baseline justify-between gap-2 bg-background py-1.5 pr-2 pl-4`}
      // The tint over the page colour, so the list scrolling beneath never shows through.
      style={{ color: accent, backgroundImage: `linear-gradient(${tint}, ${tint})` }}
    >
      {children}
    </p>
  );
}
