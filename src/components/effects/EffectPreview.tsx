"use client";

import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EFFECT_KIND_LABELS,
  displayName,
  downloadUrl,
  driveFileUrl,
  extensionOf,
  previewUrl,
  thumbnailUrl,
  type EffectEntry,
} from "@/lib/effect-model";

/** What plays in the dialog. Everything is served by Drive, nothing by this site. */
function Stage({ entry }: { entry: EffectEntry }) {
  if (entry.kind === "image") {
    return (
      <div className="checkerboard flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border-soft">
        {/* eslint-disable-next-line @next/next/no-img-element -- see EffectTile */}
        <img
          src={thumbnailUrl(entry.id, 1600)}
          alt={displayName(entry.file)}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  if (entry.kind === "font") {
    return (
      <div className="checkerboard flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-border-soft px-6 text-center">
        <span className="text-5xl font-semibold">Aa</span>
        <p className="max-w-sm text-sm text-muted">
          Drive cannot preview a font. Download it and install it to try it out.
        </p>
      </div>
    );
  }

  // Drive's player, keyed by file so moving to the next one loads it afresh.
  return (
    <iframe
      key={entry.id}
      src={previewUrl(entry.id)}
      title={displayName(entry.file)}
      allow="autoplay; fullscreen"
      allowFullScreen
      className={`w-full rounded-xl border border-border-soft bg-black ${
        entry.kind === "audio" ? "h-44" : "aspect-video"
      }`}
    />
  );
}

/**
 * The one preview dialog for a page. It is handed the list on screen and the
 * position in it, so the arrows — and the arrow keys — step through the same
 * files the reader sees behind it, in the same order.
 */
export function EffectPreview({
  entries,
  index,
  onIndexChange,
}: {
  entries: EffectEntry[];
  index: number | null;
  onIndexChange: (next: number | null) => void;
}) {
  const entry = index === null ? undefined : entries[index];
  const hasPrevious = index !== null && index > 0;
  const hasNext = index !== null && index < entries.length - 1;

  function step(by: number) {
    if (index === null) return;
    const next = index + by;
    if (next >= 0 && next < entries.length) onIndexChange(next);
  }

  return (
    <Dialog open={entry !== undefined} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        className="gap-5 p-5 sm:max-w-3xl sm:p-6"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
      >
        {entry && (
          <>
            <DialogHeader className="pr-10">
              <DialogTitle className="text-lg leading-snug break-words">
                {displayName(entry.file)}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="rounded-md">
                  {EFFECT_KIND_LABELS[entry.kind]} · {extensionOf(entry.file)}
                </Badge>
                <span>
                  {entry.pack}
                  {entry.group && ` / ${entry.group}`}
                </span>
              </DialogDescription>
            </DialogHeader>

            <Stage entry={entry} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => step(-1)}
                  disabled={!hasPrevious}
                  aria-label="Previous file"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => step(1)}
                  disabled={!hasNext}
                  aria-label="Next file"
                >
                  <ChevronRight />
                </Button>
                <span className="text-xs text-muted">
                  {index! + 1} of {entries.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <a href={driveFileUrl(entry.id)} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Open in Drive
                  </a>
                </Button>
                <Button asChild>
                  <a href={downloadUrl(entry.id)} target="_blank" rel="noreferrer">
                    <Download />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
