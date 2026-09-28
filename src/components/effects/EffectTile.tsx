"use client";

import { AudioLines, Image as ImageIcon, Play, Type } from "lucide-react";
import { useState } from "react";
import {
  displayName,
  extensionOf,
  thumbnailUrl,
  type EffectEntry,
  type EffectKind,
} from "@/lib/effects/effect-model";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

const KIND_ICONS: Record<EffectKind, typeof Play> = {
  video: Play,
  audio: AudioLines,
  image: ImageIcon,
  font: Type,
};

/** Audio and fonts have no still to show; Drive answers them with a generic icon. */
function hasThumbnail(kind: EffectKind): boolean {
  return kind === "video" || kind === "image";
}

/**
 * One file in a grid: its thumbnail from Drive, its name, and — in a search
 * across the library — the pack it came from. The whole tile opens the preview.
 */
export function EffectTile({
  entry,
  onOpen,
  showPack = false,
}: {
  entry: EffectEntry;
  onOpen: () => void;
  showPack?: boolean;
}) {
  // Drive has no still for some files, a ProRes .mov among them. The tile then
  // falls back to the icon rather than showing a broken image.
  const [failed, setFailed] = useState(false);
  const Icon = KIND_ICONS[entry.kind];
  const name = displayName(entry.file);
  const showImage = hasThumbnail(entry.kind) && !failed;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col gap-2 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-border-soft transition-colors group-hover:border-foreground/25 ${
          showImage ? "checkerboard" : "bg-muted-surface"
        }`}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element --
             Served by Google's CDN already resized; next/image cannot optimise
             in a static export without a custom loader, and there is nothing
             for one to add. */
          <img
            // An image that failed before hydration never reports it to
            // onError, so a broken one is caught again as it mounts.
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setFailed(true);
            }}
            src={thumbnailUrl(entry.id)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={`size-full transition-transform duration-300 group-hover:scale-105 ${
              entry.kind === "video" ? "object-cover" : "object-contain p-2"
            }`}
          />
        ) : entry.kind === "font" ? (
          <span className="text-3xl font-semibold" style={{ color: AppColors.EFFECTS }}>
            Aa
          </span>
        ) : (
          <Icon aria-hidden className="size-8" style={{ color: AppColors.EFFECTS }} />
        )}

        <span className="absolute left-2 top-2 rounded-md bg-background/85 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted backdrop-blur-sm">
          {extensionOf(entry.file)}
        </span>

        {entry.kind === "video" && (
          <span
            aria-hidden
            className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <Play className="size-3.5 fill-current" />
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <span className="line-clamp-2 text-sm leading-5 break-words" title={entry.file}>
          {name}
        </span>
        {showPack && <span className={`${AppTextStyles.CAPTION} truncate`}>{entry.pack}</span>}
      </span>
    </button>
  );
}
