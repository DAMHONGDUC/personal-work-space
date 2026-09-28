import type { IconType } from "react-icons";
import { FaAndroid, FaGlobe, FaReact, FaRocket, FaServer, FaWandMagicSparkles } from "react-icons/fa6";
import { SiFlutter } from "react-icons/si";
import type { SkillIconId } from "@/lib/portfolio/portfolio-model";

/**
 * The mark for each skill area id. A platform gets its own logo — Android,
 * Flutter, React — and an area that is not one product gets a plain symbol.
 */
const ICONS: Record<SkillIconId, IconType> = {
  android: FaAndroid,
  flutter: SiFlutter,
  react: FaReact,
  backend: FaServer,
  web: FaGlobe,
  ai: FaWandMagicSparkles,
  release: FaRocket,
};

/** A skill area's icon in a small tile, tinted with the page's accent. */
export function SkillIcon({ id }: { id: SkillIconId }) {
  const Icon = ICONS[id];

  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-muted-surface text-[var(--pf-a)]"
    >
      <Icon className="size-5" />
    </span>
  );
}
