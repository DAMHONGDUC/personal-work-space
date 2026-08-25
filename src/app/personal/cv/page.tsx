import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/apps";
import { cv, getCvPages, getCvPdf } from "@/lib/cv";
import { routes, withBasePath } from "@/lib/routes";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae for ${cv.header.name}.`,
  alternates: { canonical: `${routes.cv}/` },
};

export default function CvPage() {
  const pdf = getCvPdf();
  const pages = getCvPages();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="flex max-w-2xl flex-col gap-5 pb-12">
        <span className="w-fit rounded-full border border-border-soft px-3 py-1 text-xs text-muted">
          Updated {formatDate(cv.lastUpdated)}
        </span>
        {/* Just "CV": the name is already in the site header and again at the
            top of the document below. */}
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">CV</h1>
        <p className="text-lg leading-8 text-muted">
          My background, experience and skills. Read the full CV below, or take a
          copy with you.
        </p>
      </div>

      {pdf && (
        <div className="flex flex-wrap items-center gap-3 pb-10">
          {/* asChild keeps these anchors — a download and an external link are
              navigation, not buttons, whatever they look like. */}
          <Button asChild size="lg" className="h-11 rounded-xl px-5 font-semibold">
            {/* The file is served as cv.pdf; `download` renames the visitor's
                copy to something they can find again in a downloads folder. */}
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
          <span className="text-xs text-muted">PDF · {pdf.sizeKb} KB</span>
        </div>
      )}

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
              alt={`${cv.header.name} CV, page ${index + 1} of ${pages.length}`}
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
          <p className="text-sm text-muted">
            The CV is not available to preview right now. Please try the download
            above, or check back shortly.
          </p>
        </div>
      )}
    </main>
  );
}
