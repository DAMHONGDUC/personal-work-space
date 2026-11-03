import { PublicImage } from "@/components/shared/PublicImage";
import { cn } from "@/lib/utils";

/**
 * A project's 4:3 cover, the one Upwork's portfolio shows, drawn the same in
 * the Upwork tab and on the portfolio.
 */
export function ProjectCover({ src, name, className }: { src: string; name: string; className?: string }) {
  return (
    <PublicImage
      src={src}
      alt={`${name} cover`}
      className={cn("aspect-[4/3] w-full rounded-xl border border-border-soft object-cover", className)}
    />
  );
}
