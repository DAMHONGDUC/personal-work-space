import { PublicImage } from "@/components/portfolio/PublicImage";
import { enterStyle } from "@/components/portfolio/enter-style";

/**
 * The photo, framed plainly, with a location chip pinned to its corner. On
 * load the frame opens like a curtain from the bottom while the photo settles
 * from a slight zoom, then the chip rises in — `delay` sets where that falls
 * in the hero's opening sequence.
 */
export function Avatar({ src, alt, badge, delay = 0 }: { src: string; alt: string; badge: string; delay?: number }) {
  return (
    <div className="relative mx-auto size-56 shrink-0 sm:size-72">
      <div
        className="pf-curtain size-full overflow-hidden rounded-3xl border border-border-soft shadow-xl"
        style={enterStyle(delay)}
      >
        <PublicImage src={src} alt={alt} className="size-full object-cover" />
      </div>
      <span
        className="pf-enter absolute -bottom-3 -left-3 rounded-xl border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium shadow-md"
        style={enterStyle(delay + 700)}
      >
        {badge}
      </span>
    </div>
  );
}
