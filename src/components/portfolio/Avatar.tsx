import { PublicImage } from "@/components/portfolio/PublicImage";

/** The photo, framed plainly, with a location chip pinned to its corner. */
export function Avatar({ src, alt, badge }: { src: string; alt: string; badge: string }) {
  return (
    <div className="relative mx-auto size-56 shrink-0 sm:size-72">
      <PublicImage
        src={src}
        alt={alt}
        className="size-full rounded-3xl border border-border-soft object-cover shadow-xl"
      />
      <span className="absolute -bottom-3 -left-3 rounded-xl border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium shadow-md">
        {badge}
      </span>
    </div>
  );
}
