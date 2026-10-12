"use client";

import { useEffect, useRef } from "react";
import type { HtmlBlock as HtmlBlockData } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";
import { copyText } from "@/lib/shared/clipboard";

/** How long a copy button says "Copied" before going back to "Copy". */
const CONFIRM_MS = 1500;

/**
 * Markdown from another repo, as the HTML `npm run docs:sync` rendered it.
 *
 * The HTML is the site's own build output, written from the owner's Markdown
 * and committed, never anything a visitor typed, so it is drawn as it is. Its
 * look comes from the `.md-body` rules in globals.css; the colours the code
 * picks are handed over here as variables, the way the diagrams take theirs.
 *
 * Its code blocks carry a copy button the sync drew; React attaches nothing to
 * HTML drawn as a string, so one listener on the block answers them all.
 */
export function HtmlBlock({ block, accent }: { block: HtmlBlockData; accent: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const timers = new Set<number>();

    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest?.<HTMLButtonElement>(".md-copy");
      const code = button?.closest(".md-code")?.querySelector("pre");
      if (!button || !code) return;
      if (!(await copyText(code.textContent ?? ""))) return;

      const label = button.querySelector(".md-copy-label");
      if (label) label.textContent = "Copied";
      button.setAttribute("aria-label", "Copied");
      const timer = window.setTimeout(() => {
        if (label) label.textContent = "Copy";
        button.setAttribute("aria-label", "Copy code");
        timers.delete(timer);
      }, CONFIRM_MS);
      timers.add(timer);
    };

    element.addEventListener("click", onClick);
    return () => {
      element.removeEventListener("click", onClick);
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={root}
      className="md-body mt-5 min-w-0 first:mt-0"
      style={
        {
          "--md-accent": accent,
          "--md-tag-new": AppColors.MARKDOWN_TAGS.new,
          "--md-tag-edit": AppColors.MARKDOWN_TAGS.edit,
          "--md-tag-replace": AppColors.MARKDOWN_TAGS.replace,
          "--md-tag-check": AppColors.MARKDOWN_TAGS.check,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}
