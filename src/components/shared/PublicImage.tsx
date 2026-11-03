import { withBasePath } from "@/lib/routes/routes";

type Props = {
  /** A path under `public/`, leading slash included. */
  src: string;
  alt: string;
  className?: string;
};

/**
 * An image shipped in `public/`, with the base path the Pages build serves
 * under.
 *
 * A plain `<img>` rather than next/image: a static export has no optimiser to
 * run, and every file here is already sized for where it is drawn.
 */
export function PublicImage({ src, alt, className }: Props) {
  // eslint-disable-next-line @next/next/no-img-element -- see above
  return <img src={withBasePath(src)} alt={alt} className={className} loading="lazy" />;
}
