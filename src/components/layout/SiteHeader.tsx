import { HeaderBrand } from "@/components/layout/HeaderBrand";
import { HeaderNav } from "@/components/layout/HeaderNav";

/**
 * Sticky top bar: `HeaderBrand` on the left, `HeaderNav` on the right. On an
 * ordinary page the two lead home. On a standalone page — the portfolio — the
 * header belongs to the page: its sections are pinned on the right, and the
 * name returns to its top.
 *
 * The background is driven entirely by CSS (see `.site-header` in globals.css):
 * solid by default, and transparent only at the very top of the page where a
 * scroll-driven animation is supported, so a hero gradient can run through it
 * as one unbroken block. No client JavaScript is involved, so it cannot end up
 * stuck transparent if hydration or an animation stalls.
 */
export function SiteHeader({ publisher }: { publisher: string }) {
  return (
    <header className="site-header sticky top-0 z-20 border-b">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-6">
        <HeaderBrand publisher={publisher} />

        <HeaderNav />
      </div>
    </header>
  );
}
