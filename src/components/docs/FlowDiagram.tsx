"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FlowBlock, FlowItem, Lang } from "@/lib/docs/doc-model";

/**
 * A diagram drawn from the data in a `flow` block: each stage is a row of boxes,
 * with an arrow down to the next one. One box per stage reads as a pipeline;
 * several boxes feeding a single one reads as a join, which is how the signing
 * pieces actually fit together.
 *
 * It is laid out with flexbox rather than an SVG so the labels wrap and stay
 * selectable, and so it survives a narrow phone without a viewBox to fight.
 *
 * Every box is a button. The diagram carries the short version — a label and a
 * phrase — and clicking a box opens the step's `explain` points in a dialog, so
 * the picture stays scannable and the reader who stops at one step gets the
 * whole story without leaving the page.
 */
export function FlowDiagram({
  block,
  accent,
  lang,
}: {
  block: FlowBlock;
  accent: string;
  lang: Lang;
}) {
  // The item is kept after the dialog closes, so the text does not vanish
  // half-way through the fade out.
  const [step, setStep] = useState<FlowItem | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <figure
      // The accent arrives as data rather than a class, and a hover or focus
      // colour cannot be written inline — so it is handed to CSS once here and
      // the boxes below mix against it.
      style={{ "--flow-accent": accent } as React.CSSProperties}
      className="mt-5 flex max-w-[68ch] flex-col gap-3 rounded-2xl border border-border-soft bg-muted-surface p-5 sm:p-6"
    >
      <div className="flex flex-col items-stretch gap-2">
        {block.stages.map((stage, stageIndex) => (
          <div key={stageIndex} className="flex flex-col items-stretch gap-2">
            {stageIndex > 0 && (
              <span aria-hidden className="text-center text-sm leading-none text-muted">
                ↓
              </span>
            )}

            <div className="grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
              {stage.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setStep(item);
                    setOpen(true);
                  }}
                  className="group relative flex flex-col gap-1 rounded-xl border border-[color-mix(in_oklab,var(--flow-accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--flow-accent)_6%,var(--surface))] px-4 py-3 text-left transition-colors outline-none hover:bg-[color-mix(in_oklab,var(--flow-accent)_16%,var(--surface))] focus-visible:ring-3 focus-visible:ring-[color-mix(in_oklab,var(--flow-accent)_35%,transparent)]"
                >
                  <span className="pr-5 text-sm font-medium leading-6">
                    {item.label}
                  </span>
                  <span className="text-xs leading-5 text-muted">{item.detail}</span>

                  {/* The affordance is an icon rather than a word: the dialog
                      is opened from a guide written in either language, and a
                      drawn plus needs no translating. */}
                  <PlusIcon
                    aria-hidden
                    className="absolute top-3.5 right-3 size-3.5 opacity-40 transition-opacity group-hover:opacity-100"
                    style={{ color: accent }}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {block.caption && (
        <figcaption className="text-xs leading-5 text-muted">{block.caption}</figcaption>
      )}

      {/* One dialog for the whole diagram rather than one per box: only ever a
          single step is open, and the portal moves it out of `main`, so it
          states the language of its own text. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          lang={lang}
          // The portal puts this outside the figure, so the accent has to be
          // handed to it a second time.
          style={{ "--flow-accent": accent } as React.CSSProperties}
          className="sm:max-w-lg"
        >
          {step && (
            <>
              <DialogHeader>
                <DialogTitle>{step.label}</DialogTitle>
                <DialogDescription>{step.detail}</DialogDescription>
              </DialogHeader>

              {/* The points are what the box was clicked for, so they sit in a
                  panel of their own instead of running on under the heading —
                  tinted with the same accent as the box that opened them. */}
              <div className="mx-auto w-full rounded-xl border border-[color-mix(in_oklab,var(--flow-accent)_22%,transparent)] bg-[color-mix(in_oklab,var(--flow-accent)_8%,var(--muted-surface))] px-5 py-4 sm:px-6 sm:py-5">
                <ul className="flex flex-col gap-3">
                  {step.explain.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-6">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      <span className="text-muted">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </figure>
  );
}
