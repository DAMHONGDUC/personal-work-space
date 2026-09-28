import { PublicImage } from "@/components/portfolio/PublicImage";

/** `Reseller Studio` -> `RS`, `SiteLog` -> `SL`: the placeholder's letters. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? words.map((word) => word.charAt(0))
      : (name.match(/\p{Lu}/gu) ?? [name.charAt(0)]);

  return letters.join("").slice(0, 2).toUpperCase();
}

/**
 * A project's app icon, or a placeholder until it has one: the project's
 * initials on a dashed tile, so a missing icon reads as "not yet" rather than
 * as a broken image. Tilts a touch when its card is hovered.
 */
export function ProjectIcon({ name, src }: { name: string; src?: string }) {
  const frame =
    "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition-transform duration-300 group-hover:[transform:rotate(-4deg)_scale(1.06)]";

  if (src) {
    return (
      <span className={`${frame} border border-border-soft shadow-md`}>
        <PublicImage src={src} alt={`${name} app icon`} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} (no app icon yet)`}
      className={`${frame} border border-dashed border-foreground/20 bg-muted-surface text-base font-semibold tracking-tight text-muted`}
    >
      {initials(name)}
    </span>
  );
}
