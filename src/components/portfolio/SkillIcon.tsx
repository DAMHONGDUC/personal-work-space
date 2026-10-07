import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import {
  SiAndroid,
  SiAppstore,
  SiClaude,
  SiFlutter,
  SiGithubactions,
  SiIos,
  SiNextdotjs,
  SiReact,
  SiRevenuecat,
} from "react-icons/si";
import { AppColors } from "@/lib/design/app-colors";
import type { SkillIconId } from "@/lib/portfolio/portfolio-model";

/**
 * Each id's mark and the brand colour it is published in. `color` is absent
 * for a monochrome mark, which then takes the text colour and so reads in both
 * themes, as the maker's own black-or-white logo does.
 */
const MARKS: Record<SkillIconId, { Icon: IconType; color?: string }> = {
  android: { Icon: SiAndroid, color: AppColors.BRAND.android },
  flutter: { Icon: SiFlutter, color: AppColors.BRAND.flutter },
  react: { Icon: SiReact, color: AppColors.BRAND.react },
  "app-store": { Icon: SiAppstore, color: AppColors.BRAND.appStore },
  ios: { Icon: SiIos },
  revenuecat: { Icon: SiRevenuecat, color: AppColors.BRAND.revenueCat },
  nextjs: { Icon: SiNextdotjs },
  claude: { Icon: SiClaude, color: AppColors.BRAND.claude },
  "github-actions": { Icon: SiGithubactions, color: AppColors.BRAND.githubActions },
};

/** A skill area's mark in its brand colour, on a faint wash of that colour. */
export function SkillIcon({ id }: { id: SkillIconId }) {
  const { Icon, color } = MARKS[id];
  const tile: CSSProperties | undefined = color
    ? {
        color,
        backgroundColor: AppColors.tint(color, 12),
        borderColor: AppColors.tint(color, 30),
      }
    : undefined;

  return (
    <span
      aria-hidden
      style={tile}
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-muted-surface text-foreground"
    >
      <Icon className="size-5" />
    </span>
  );
}
