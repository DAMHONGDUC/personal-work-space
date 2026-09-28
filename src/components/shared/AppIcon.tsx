import { withBasePath } from "@/lib/routes/routes";

type Props = {
  /**
   * Either an emoji, or a path under `public/` such as
   * `/app_icons/reseller-studio.png`. A leading slash is what tells the two
   * apart, because no emoji starts with one.
   */
  icon: string;
  accent: string;
  size?: "sm" | "lg";
};

/** A value rooted at the site is a file to draw; anything else is text. */
function isImagePath(icon: string): boolean {
  return icon.startsWith("/");
}

export function AppIcon({ icon, accent, size = "sm" }: Props) {
  const box = size === "lg" ? "size-16 text-3xl rounded-2xl" : "size-11 text-xl rounded-xl";

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-border-soft ${box}`}
      style={{
        backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
        borderColor: `color-mix(in oklab, ${accent} 28%, transparent)`,
      }}
    >
      {isImagePath(icon) ? (
        /* eslint-disable-next-line @next/next/no-img-element --
           next/image buys nothing here: the file ships with the static export
           at a size this box already fixes, so there is no optimisation step
           to run. The tint behind it still shows through a transparent PNG. */
        <img src={withBasePath(icon)} alt="" className="size-full object-cover" />
      ) : (
        icon
      )}
    </span>
  );
}
