import { ArrowUpRight, CirclePlay } from "lucide-react";
import type { LinksBlock } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * A short list of things to open elsewhere, each a bordered row so it reads as
 * something to press rather than as part of the text. Every one opens in a new
 * tab: the reader is following a guide and should not lose their place in it.
 */
export function DocLinks({ block, accent }: { block: LinksBlock; accent: string }) {
  return (
    <ul className="mt-5 flex max-w-[80ch] flex-col gap-2.5">
      {block.items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="group/link flex items-center gap-3.5 rounded-xl border border-border-soft bg-surface px-4 py-3 transition-colors hover:bg-muted-surface"
          >
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${AppColors.tint(accent, 14)}`, color: accent }}
            >
              <CirclePlay className="size-4.5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className={AppTextStyles.CAPTION}>{item.source}</span>
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-muted transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
