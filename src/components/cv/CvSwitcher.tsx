"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CvVersion } from "@/lib/cv/cv-types";
import { formatDate } from "@/lib/format";
import { withBasePath } from "@/lib/routes/routes";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The CV, with a dropdown for choosing which version of it to read.
 *
 * Several CVs live side by side in the data directory, each cut for a
 * different reader, and the build compiles every one of them. Switching is
 * client-side state rather than a route per version: the pages are already in
 * the export, so a change of version is an image swap and never a navigation
 * that loses the reader's place.
 *
 * The whole set is rendered by the server component that hosts this, and
 * everything the switcher needs arrives as props — no fetch, in a site that
 * has no server to fetch from.
 */
export function CvSwitcher({ versions }: { versions: CvVersion[] }) {
  const [slug, setSlug] = useState(versions[0].slug);
  const current = versions.find((version) => version.slug === slug) ?? versions[0];
  const { pdf, pages } = current;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pb-10">
        {versions.length > 1 && (
          <label className="flex items-center gap-3">
            <span className="sr-only">Which version of the CV to show</span>
            <Select value={slug} onValueChange={setSlug}>
              <SelectTrigger
                size="default"
                className="h-11 rounded-xl px-4 font-semibold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.slug} value={version.slug}>
                    {version.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        {pdf && (
          <>
            {/* asChild keeps these anchors — a download and an external link are
                navigation, not buttons, whatever they look like. */}
            <Button asChild size="lg" className="h-11 rounded-xl px-5 font-semibold">
              {/* Each version is served as its own cv.pdf; `download` renames the
                  visitor's copy to something they can find again in a downloads
                  folder, and tells the two versions apart once it is there. */}
              <a href={withBasePath(pdf.url)} download={pdf.fileName}>
                Download CV
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-xl px-5 font-semibold"
            >
              <a
                href={withBasePath(pdf.url)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open CV ↗
              </a>
            </Button>
            <span className={AppTextStyles.CAPTION}>PDF · {pdf.sizeKb} KB</span>
          </>
        )}

        <span className={AppTextStyles.CAPTION}>
          Updated {formatDate(current.data.lastUpdated)}
        </span>
      </div>

      {pages.length > 0 ? (
        // Pages sit in the document flow, so the whole CV is rendered at once
        // and the ordinary page scroll carries it — no nested scroll box, which
        // is all an embedded PDF viewer can give.
        // Padding is uniform on all four sides. At the widest breakpoint it is
        // 5rem, which leaves exactly 816px of content — so the page fills the
        // box rather than being centred in it, and the space around it is the
        // padding itself instead of leftover room.
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#25262b] p-4 sm:gap-8 sm:p-8 lg:gap-20 lg:p-20">
          {pages.map((page, index) => (
            /* eslint-disable-next-line @next/next/no-img-element --
               next/image buys nothing here: these are build-time PNGs of known
               size in a static export, so there is no optimisation step to run
               and the width/height below already reserve the space. */
            <img
              key={page.url}
              src={withBasePath(page.url)}
              width={page.width}
              height={page.height}
              alt={`${current.data.header.name} CV, ${current.label}, page ${index + 1} of ${pages.length}`}
              // 816px is US Letter at the 96dpi CSS reference — the width a PDF
              // viewer shows the page at 100% zoom. Narrower screens scale it
              // down; wider ones leave the backdrop showing either side.
              className="h-auto w-full max-w-[816px] rounded-lg shadow-xl shadow-black/25"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-soft px-6 py-16 text-center">
          {/* Only reachable if the build did not produce the page images, so it
              is worded for a visitor first — a developer already has the
              script's own message on the console. */}
          <p className={AppTextStyles.SMALL}>
            The CV is not available to preview right now. Please try the download
            above, or check back shortly.
          </p>
        </div>
      )}
    </>
  );
}
